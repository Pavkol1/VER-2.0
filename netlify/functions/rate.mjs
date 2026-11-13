/* Daily EUR→HUF rate for the room-service page.
 *
 * Which rate: Erste Bank's buying rate ("vétel") for the euro — management's
 * decision of 2026-11-13. The page then applies its own 2% buffer on top
 * (SPREAD in room-service.html), which management confirmed the same day.
 *
 * Why a function and not a fetch from the page: the browser cannot reach any
 * of the sources. None of them sends a CORS header. Going through here also
 * means a guest's browser makes no third-party request — the room-service
 * page talks to this domain and nothing else.
 *
 * Three sources are fetched every time, and that is deliberate:
 *
 *   Erste Bank is the rate we use. It comes from the public JSON feed behind
 *   erstebank.hu/hu/arfolyamok-table, served over https:// with no key. The
 *   feed is not documented or offered to third parties, so it can change
 *   shape without notice — which is why its answer is checked from two sides
 *   before it prices anything:
 *
 *     - on its own: the buying rate must sit below Erste's middle rate, by no
 *       more than MAX_SPREAD. Erste's cash table runs a steady 3.5% either
 *       side of its middle (352.75 / 365.54 on 2026-11-13).
 *     - against the market: Erste's MIDDLE rate — not the buying rate, which
 *       is meant to sit 3.5% low — must agree with the witness within
 *       TOLERANCE. Middle and MNB normally sit a few tenths of a percent apart.
 *
 *   MNB and the ECB are the witness, never the price. MNB is reachable over
 *   plain http:// only, so it counts only when the ECB, over https://,
 *   corroborates it; failing that the ECB stands in; failing that an MNB rate
 *   near REFERENCE. See witness().
 *
 * Decision order (pick()):
 *   1. Erste missing or malformed           → null
 *   2. a witness exists, Erste middle agrees → Erste buying rate
 *   3. a witness exists, Erste disagrees     → null. Something is wrong with
 *                                              the feed; better no answer than
 *                                              a confident wrong one.
 *   4. no witness, Erste middle near REFERENCE → Erste buying rate
 *   5. otherwise                             → null
 * On null the page keeps the rate it cached on an earlier visit, else its own
 * hardcoded FALLBACK, so a guest never sees a broken price.
 *
 * There is deliberately no fall-back to MNB's own number. It is a middle rate,
 * 3.5% above the buying rate: prices would visibly drop during an Erste outage
 * and jump back afterwards.
 *
 * No dependencies, no build step: Netlify runs this file as it is.
 */

const BOUNDS = [250, 500];      /* HUF per EUR. A first filter: anything outside
                                   is a parse error or a corrupted response. */
const TOLERANCE = 0.02;         /* how far two middle rates may sit apart and
                                   still be believed. Applies to MNB against the
                                   ECB, and to Erste's middle against either. */
const MAX_SPREAD = 0.08;        /* the furthest Erste's buying rate may sit below
                                   its middle. Normally 0.035. */
const REFERENCE = 365;          /* a MIDDLE rate: Erste's middle and MNB were
                                   365.54 and 364.92 around 2026-11-13. Bounds a
                                   middle rate when nothing can corroborate it.
                                   The page's FALLBACK is a buying rate and so
                                   sits about 3.5% lower; refresh both together. */
const REFERENCE_BAND = 0.05;
const TIMEOUT = 4000;

/* Which Erste table to read. The cash table ("Valuta") is the one
   erstebank.hu/hu/arfolyamok-table opens on, and the one management looked
   at. The others, should that change, are the account-conversion table
   (type 'ip_banknote', key 'ipInterBank') and the commercial table
   ('ip_exchange', 'ipCommercial'); both quote more than once a day, which
   parseErste() already handles by keeping the latest. */
const ERSTE = {
  url: 'https://openbankapi.erstebank.hu/public/api/v1/fxRatesList',
  type: 'Banknote',
  key: 'banknoteRate',
  label: 'Erste Bank cash buying',
  lookback: 6                   /* days searched back when today has no quote:
                                   weekends, public holidays, and the run from
                                   Christmas Eve to the following Monday. */
};

const MNB_URL = 'http://www.mnb.hu/arfolyamok.asmx';
const MNB_ACTION = '"http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates"';
const MNB_BODY = '<?xml version="1.0" encoding="utf-8"?>' +
  '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>' +
  '<GetCurrentExchangeRates xmlns="http://tempuri.org/"/>' +
  '</soap:Body></soap:Envelope>';

const ECB_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

function sane (n) {
  return typeof n === 'number' && isFinite(n) && n >= BOUNDS[0] && n <= BOUNDS[1] ? n : null;
}

/* Erste answers {"fx":[{"currency":"EUR","banknoteRate":{"buy":352.75,
   "middle":365.54,"sell":378.33,"lastModified":"2026-11-13T08:00:00+01:00",
   ...}}]}, or {"fx":[]} for a day without a quote. Some tables carry several
   quotes a day; the latest wins. Exported for tools/test_rate.mjs. */
export function parseErste (body, key = ERSTE.key, label = ERSTE.label) {
  let d = null;
  try { d = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { return null; }
  const rows = d && Array.isArray(d.fx) ? d.fx : [];
  let best = null;
  for (const row of rows) {
    if (!row || row.currency !== 'EUR') continue;
    const q = row[key];
    if (!q || typeof q !== 'object') continue;
    const buy = sane(q.buy), middle = sane(q.middle);
    if (!buy || !middle || buy >= middle || (middle - buy) / middle > MAX_SPREAD) continue;
    const m = typeof q.lastModified === 'string' ? q.lastModified.match(/^(\d{4}-\d{2}-\d{2})T/) : null;
    const stamp = m ? Date.parse(q.lastModified) : NaN;
    if (!best || (isFinite(stamp) && !(stamp <= best.stamp))) {
      best = { rate: buy, middle, date: m ? m[1] : null, source: label, stamp };
    }
  }
  if (!best) return null;
  delete best.stamp;
  return best;
}

/* MNB answers with a SOAP envelope whose payload is XML escaped as text, and
   the numbers carry a Hungarian decimal comma. `unit` is 1 for the euro but
   100 for some currencies, so divide rather than assume. */
export function parseMnb (soap) {
  const xml = soap.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const rate = xml.match(/<Rate\b[^>]*\bunit="(\d+)"[^>]*\bcurr="EUR"[^>]*>([\d.,]+)</i);
  if (!rate) return null;
  const unit = Number(rate[1]);
  const value = Number(rate[2].replace(/\./g, '').replace(',', '.'));
  if (!unit || !isFinite(value)) return null;
  const day = xml.match(/<Day\b[^>]*\bdate="(\d{4}-\d{2}-\d{2})"/i);
  const n = sane(value / unit);
  return n ? { rate: n, date: day ? day[1] : null, source: 'MNB' } : null;
}

/* ECB uses single quotes on attributes; accept either. */
export function parseEcb (xml) {
  const rate = xml.match(/currency=['"]HUF['"]\s+rate=['"]([\d.]+)['"]/i);
  if (!rate) return null;
  const day = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/i);
  const n = sane(Number(rate[1]));
  return n ? { rate: n, date: day ? day[1] : null, source: 'ECB' } : null;
}

/* Today in Budapest, shifted by whole days, as YYYY-MM-DD. */
export function budapestDate (offsetDays, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
  return new Date(Date.parse(today + 'T12:00:00Z') + offsetDays * 86400000).toISOString().slice(0, 10);
}

async function text (url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(url.split('?')[0] + ' answered ' + res.status);
  return res.text();
}

function ersteUrl (date) {
  return ERSTE.url + '?rateType=' + ERSTE.type + '&currencies=EUR' + (date ? '&date=' + date : '');
}

/* The undated query normally returns the latest quote. On a day without one
   it may come back empty, so ask for the previous days at once and keep the
   most recent that has a quote. */
async function fromErste () {
  const current = parseErste(await text(ersteUrl()));
  if (current) return current;
  const days = [];
  for (let i = 1; i <= ERSTE.lookback; i++) days.push(budapestDate(-i));
  const found = await Promise.all(days.map(function (d) {
    return attempt(async function () { return parseErste(await text(ersteUrl(d))); });
  }));
  return found.find(Boolean) || null;
}

async function fromMnb () {
  return parseMnb(await text(MNB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: MNB_ACTION },
    body: MNB_BODY
  }));
}

async function fromEcb () {
  return parseEcb(await text(ECB_URL));
}

/* The market middle rate to check Erste against, or null. MNB arrives over
   unencrypted http, so it counts only when the ECB says roughly the same. */
export function witness (mnb, ecb) {
  if (mnb && ecb) {
    if (Math.abs(mnb.rate / ecb.rate - 1) <= TOLERANCE) return mnb;
    console.warn('rate: MNB ' + mnb.rate + ' disagrees with ECB ' + ecb.rate + ', witness is ECB');
    return ecb;
  }
  if (ecb) return ecb;
  if (mnb) {
    if (Math.abs(mnb.rate / REFERENCE - 1) <= REFERENCE_BAND) return mnb;
    console.warn('rate: MNB ' + mnb.rate + ' is uncorroborated and far from ' + REFERENCE + ', no witness');
  }
  return null;
}

/* Whether to serve Erste's buying rate. Exported for the offline test. */
export function pick (erste, mnb, ecb) {
  if (!erste) return null;
  const w = witness(mnb, ecb);
  if (w) {
    if (Math.abs(erste.middle / w.rate - 1) <= TOLERANCE) return erste;
    console.warn('rate: Erste middle ' + erste.middle + ' disagrees with ' + w.source + ' ' + w.rate + ', refusing');
    return null;
  }
  if (Math.abs(erste.middle / REFERENCE - 1) <= REFERENCE_BAND) return erste;
  console.warn('rate: Erste middle ' + erste.middle + ' is uncorroborated and far from ' + REFERENCE + ', refusing');
  return null;
}

async function attempt (get) {
  try {
    return await get();
  } catch (e) {
    /* Fall through. Nothing is logged with guest data in it; the message is ours. */
    console.warn('rate: ' + (e && e.message ? e.message : 'source failed'));
    return null;
  }
}

export default async function handler () {
  const [erste, mnb, ecb] = await Promise.all([attempt(fromErste), attempt(fromMnb), attempt(fromEcb)]);
  const chosen = pick(erste, mnb, ecb);
  /* Only what the page needs. Erste's middle rate was for checking, not for
     publishing. */
  const out = chosen ? { rate: chosen.rate, date: chosen.date, source: chosen.source } : null;

  /* On success the answer is cached for an hour at the edge and may be served
     stale for a day while it refreshes, so the sources are hit roughly once an
     hour at most and a guest never waits on them. On failure it is cached for
     a minute only, so a blip does not freeze a wrong answer in place. */
  const cache = out
    ? 'public, max-age=900, stale-while-revalidate=86400'
    : 'public, max-age=60';

  return new Response(JSON.stringify(out || { rate: null, date: null, source: 'unavailable' }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'netlify-cdn-cache-control': out
        ? 'public, s-maxage=3600, stale-while-revalidate=86400'
        : 'public, s-maxage=60'
    }
  });
}
