/* Daily EUR→HUF rate for the room-service page.
 *
 * Why a function and not a fetch from the page: the browser cannot reach
 * either source. MNB offers SOAP with no CORS header, and the European
 * Central Bank's own XML has no CORS header either. Going through here also
 * means a guest's browser makes no third-party request — the room-service
 * page talks to this domain and nothing else.
 *
 * Source order, and why:
 *   1. MNB (Magyar Nemzeti Bank). SabeeApp converts at the MNB rate, so the
 *      price a guest sees here matches what the booking system charges.
 *      Reachable over plain http:// ONLY — the same POST to https:// answers
 *      404. Unencrypted, hence the sanity check on the parsed number below.
 *   2. ECB. Published once a day around 16:00 CET, within ~0.1% of MNB.
 *   3. Neither answered: return rate null. The page then keeps its own
 *      hardcoded fallback, so a guest never sees a broken price.
 *
 * No dependencies, no build step: Netlify runs this file as it is.
 */

const BOUNDS = [250, 500];   /* HUF per EUR. Anything outside is a parse error
                                or a corrupted response, not a real rate. */
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

export default async function handler () {
  let out = null;
  for (const get of [fromMnb, fromEcb]) {
    try {
      out = await get();
      if (out) break;
    } catch (e) {
      /* Fall through to the next source. Nothing is logged with guest data in
         it; the message is ours. */
      console.warn('rate: ' + (e && e.message ? e.message : 'source failed'));
    }
  }

  /* On success the answer is cached for an hour at the edge and may be served
     stale for a day while it refreshes, so MNB is hit roughly once a day and a
     guest never waits on it. On failure it is cached for a minute only, so a
     blip does not freeze a wrong answer in place. */
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
