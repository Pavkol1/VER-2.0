/* Daily EUR→HUF rate for the room-service page.
 *
 * Why a function and not a fetch from the page: the browser cannot reach
 * either source. MNB offers SOAP with no CORS header, and the European
 * Central Bank's own XML has no CORS header either. Going through here also
 * means a guest's browser makes no third-party request — the room-service
 * page talks to this domain and nothing else.
 *
 * Both sources are fetched every time, and that is deliberate:
 *
 *   MNB (Magyar Nemzeti Bank) is the rate we want. SabeeApp converts at it,
 *   so the price a guest sees here matches what the booking system charges.
 *   But it is reachable over plain http:// ONLY — the same POST to https://
 *   answers 404 — so the number arrives over a channel nobody can vouch for.
 *   A tampered rate would quietly misprice every dish on the page: at the
 *   outer sanity bound alone, euro prices could move by a third.
 *
 *   The ECB is served over https:// and publishes the same pair daily. It
 *   therefore acts as the witness: MNB is used only when the ECB corroborates
 *   it within TOLERANCE. The two normally sit about 0.05% apart (they were
 *   363.18 and 362.99 on 2026-11-09), so 2% is loose enough to survive a
 *   volatile day — they are fixed at different hours — and tight enough that
 *   a forged rate cannot pass.
 *
 * Decision order:
 *   1. Both agree          → MNB. What we actually want.
 *   2. They disagree       → ECB. Trust the channel that can be verified.
 *   3. ECB alone           → ECB.
 *   4. MNB alone           → only if it sits within REFERENCE_BAND of
 *                            REFERENCE, because nothing can corroborate it.
 *   5. Neither             → rate null. The page keeps its own hardcoded
 *                            fallback, so a guest never sees a broken price.
 *
 * No dependencies, no build step: Netlify runs this file as it is.
 */

const BOUNDS = [250, 500];      /* HUF per EUR. A first filter: anything outside
                                   is a parse error or a corrupted response. */
const TOLERANCE = 0.02;         /* how far MNB may sit from the ECB and still
                                   be believed. See the note above. */
const REFERENCE = 363;          /* MNB on 2026-11-09. Used ONLY to bound an
                                   uncorroborated MNB rate when the ECB cannot
                                   be reached. Refresh it when the page's own
                                   FALLBACK is refreshed — they drift together. */
const REFERENCE_BAND = 0.05;
const TIMEOUT = 4000;

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

/* MNB answers with a SOAP envelope whose payload is XML escaped as text, and
   the numbers carry a Hungarian decimal comma. `unit` is 1 for the euro but
   100 for some currencies, so divide rather than assume. Exported for the
   offline test in tools/test_rate.mjs. */
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

async function text (url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) throw new Error(url + ' answered ' + res.status);
  return res.text();
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

/* Which of the two to believe. Exported for the offline test. */
export function pick (mnb, ecb) {
  if (mnb && ecb) {
    if (Math.abs(mnb.rate / ecb.rate - 1) <= TOLERANCE) return mnb;
    console.warn('rate: MNB ' + mnb.rate + ' disagrees with ECB ' + ecb.rate + ', using ECB');
    return ecb;
  }
  if (ecb) return ecb;
  if (mnb) {
    if (Math.abs(mnb.rate / REFERENCE - 1) <= REFERENCE_BAND) return mnb;
    console.warn('rate: MNB ' + mnb.rate + ' is uncorroborated and far from ' + REFERENCE + ', refusing');
  }
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
  const pair = await Promise.all([attempt(fromMnb), attempt(fromEcb)]);
  const out = pick(pair[0], pair[1]);

  /* On success the answer is cached for an hour at the edge and may be served
     stale for a day while it refreshes, so the sources are hit roughly once a
     day and a guest never waits on them. On failure it is cached for a minute
     only, so a blip does not freeze a wrong answer in place. */
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
