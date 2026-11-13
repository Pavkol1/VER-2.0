/* Checks netlify/functions/rate.mjs without deploying it.
 *
 *   node tools/test_rate.mjs          parsing, bounds and the choice, offline
 *   node tools/test_rate.mjs --live   also calls Erste, MNB and the ECB for real
 *
 * The offline part is the one that matters. It pins the shape of Erste's feed,
 * the two awkward details of the MNB payload (XML escaped as text, Hungarian
 * decimal comma), and the rule that Erste's buying rate is served only when
 * its middle rate agrees with the market.
 */
import { parseErste, parseMnb, parseEcb, witness, pick, budapestDate } from '../netlify/functions/rate.mjs';

let pass = 0, fail = 0;
function is (label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log('  ok    ' + label); }
  else { fail++; console.log('  FAIL  ' + label + '\n          got  ' + JSON.stringify(got) + '\n          want ' + JSON.stringify(want)); }
}

/* A trimmed copy of a real MNB answer, escaping and comma included. */
const MNB = '<s:Envelope><s:Body><GetCurrentExchangeRatesResponse><GetCurrentExchangeRatesResult>' +
  '&lt;MNBCurrentExchangeRates&gt;&lt;Day date="2026-11-09"&gt;' +
  '&lt;Rate unit="1" curr="CHF"&gt;396,71000&lt;/Rate&gt;' +
  '&lt;Rate unit="1" curr="EUR"&gt;363,18000&lt;/Rate&gt;' +
  '&lt;Rate unit="100" curr="JPY"&gt;218,45000&lt;/Rate&gt;' +
  '&lt;/Day&gt;&lt;/MNBCurrentExchangeRates&gt;' +
  '</GetCurrentExchangeRatesResult></GetCurrentExchangeRatesResponse></s:Body></s:Envelope>';

const ECB = "<gesmes:Envelope><Cube><Cube time='2026-11-09'>" +
  "<Cube currency='USD' rate='1.1583'/><Cube currency='HUF' rate='362.99'/>" +
  '</Cube></Cube></gesmes:Envelope>';

/* A real Erste answer for 2026-11-13, trimmed to the euro row. */
const ERSTE_ROW = { buy: 352.75, sell: 378.33, middle: 365.54, lastModified: '2026-11-13T08:00:00+01:00', currencyType: 'CURRENCY' };
const ERSTE_BODY = JSON.stringify({ fx: [{ banknoteRate: ERSTE_ROW, currency: 'EUR' }] });
const ERSTE_WANT = { rate: 352.75, middle: 365.54, date: '2026-11-13', source: 'Erste Bank cash buying' };
const erste = function (q, extra) { return JSON.stringify({ fx: [{ banknoteRate: { ...ERSTE_ROW, ...q }, currency: 'EUR' }].concat(extra || []) }); };

console.log('\nErste parsing');
is('the cash table, euro row', parseErste(ERSTE_BODY), ERSTE_WANT);
is('an already-parsed object is accepted too', parseErste(JSON.parse(ERSTE_BODY)), ERSTE_WANT);
is('a day without a quote: {"fx":[]}', parseErste('{"fx":[]}'), null);
is('empty body', parseErste(''), null);
is('html error page', parseErste('<html><body>503</body></html>'), null);
is('JSON without fx', parseErste('{"error":"x"}'), null);
is('fx not a list', parseErste('{"fx":{}}'), null);
is('no EUR row', parseErste(ERSTE_BODY.replace('"EUR"', '"USD"')), null);
is('the row is under another table key', parseErste(ERSTE_BODY.replace('banknoteRate', 'ipCommercial')), null);
is('buy given as a string', parseErste(erste({ buy: '352.75' })), null);
is('buy missing', parseErste(erste({ buy: undefined })), null);
is('middle missing', parseErste(erste({ middle: undefined })), null);
is('buy above middle — the sides swapped', parseErste(erste({ buy: 378.33, middle: 365.54 })), null);
is('buy equal to middle', parseErste(erste({ buy: 365.54 })), null);
is('buy 10% under middle — beyond MAX_SPREAD', parseErste(erste({ buy: 328.9 })), null);
is('buy 7.9% under middle — within it', parseErste(erste({ buy: 336.66 })).rate, 336.66);
is('buy out of bounds', parseErste(erste({ buy: 35275, middle: 36554 })), null);
is('no lastModified: the rate stands, the date is null', parseErste(erste({ lastModified: undefined })), { ...ERSTE_WANT, date: null });
is('a lastModified that is not a timestamp', parseErste(erste({ lastModified: 'yesterday' })).date, null);
is('several quotes in a day: the latest wins, whatever the order',
   parseErste(JSON.stringify({ fx: [
     { currency: 'EUR', banknoteRate: { ...ERSTE_ROW, buy: 351.9, middle: 364.66, lastModified: '2026-11-13T13:00:00+01:00' } },
     { currency: 'EUR', banknoteRate: ERSTE_ROW },
     { currency: 'EUR', banknoteRate: { ...ERSTE_ROW, buy: 350.0, middle: 362.7, lastModified: '2026-11-12T08:00:00+01:00' } }
   ] })).rate, 351.9);
is('a malformed row does not hide a good one',
   parseErste(JSON.stringify({ fx: [{ currency: 'EUR', banknoteRate: { buy: 'x' } }, { currency: 'EUR', banknoteRate: ERSTE_ROW }] })), ERSTE_WANT);
is('another table can be read when asked for',
   parseErste(JSON.stringify({ fx: [{ currency: 'EUR', ipCommercial: { buy: 361.31, middle: 364.96, lastModified: '2026-11-12T08:00:00+01:00' } }] }), 'ipCommercial', 'Erste Bank commercial buying'),
   { rate: 361.31, middle: 364.96, date: '2026-11-12', source: 'Erste Bank commercial buying' });

console.log('\nBudapest dates');
is('a Budapest evening is still that day', budapestDate(0, new Date('2026-11-13T22:30:00Z')), '2026-11-13');
is('just after Budapest midnight is the next day', budapestDate(0, new Date('2026-11-13T23:30:00Z')), '2026-11-14');
is('one day back across a month', budapestDate(-1, new Date('2026-12-01T10:00:00Z')), '2026-11-30');
is('six days back from Boxing Day', budapestDate(-6, new Date('2026-12-26T10:00:00Z')), '2026-12-20');
is('across the spring clock change', budapestDate(-1, new Date('2026-03-30T10:00:00Z')), '2026-03-29');

console.log('\nMNB parsing');
is('escaped XML, decimal comma, unit 1', parseMnb(MNB), { rate: 363.18, date: '2026-11-09', source: 'MNB' });
is('unit 100 is divided out', parseMnb(MNB.replace('unit="1" curr="EUR"&gt;363,18000', 'unit="100" curr="EUR"&gt;36318,00000')),
   { rate: 363.18, date: '2026-11-09', source: 'MNB' });
is('thousands dot parsed, then refused by bounds', parseMnb(MNB.replace('363,18000', '1.363,18000')), null); /* 1363.18 is out of bounds */
is('no EUR row', parseMnb(MNB.replace('curr="EUR"', 'curr="XXX"')), null);
is('rate below bounds refused', parseMnb(MNB.replace('363,18000', '12,00000')), null);
is('rate above bounds refused', parseMnb(MNB.replace('363,18000', '3631,80000')), null);
is('empty body', parseMnb(''), null);
is('html error page', parseMnb('<html><body>404 Not Found</body></html>'), null);
is('missing date still returns a rate', parseMnb(MNB.replace(' date="2026-11-09"', '')),
   { rate: 363.18, date: null, source: 'MNB' });

console.log('\nECB parsing');
is('single-quoted attributes', parseEcb(ECB), { rate: 362.99, date: '2026-11-09', source: 'ECB' });
is('double-quoted attributes', parseEcb(ECB.replace(/'/g, '"')), { rate: 362.99, date: '2026-11-09', source: 'ECB' });
is('no HUF row', parseEcb(ECB.replace("currency='HUF'", "currency='XXX'")), null);
is('empty body', parseEcb(''), null);

/* MNB arrives over unencrypted http, so as a witness it counts only when the
   ECB — which arrives over https — says roughly the same thing. */
console.log('\nThe witness');
const M = function (r) { return { rate: r, date: '2026-11-12', source: 'MNB' }; };
const E = function (r) { return { rate: r, date: '2026-11-12', source: 'ECB' }; };

is('both agree → MNB', witness(M(364.92), E(364.6)), M(364.92));
is('1.5% apart is still MNB', witness(M(368), E(362.56)), M(368));
is('5% apart → ECB', witness(M(381), E(363)), E(363));
is('a forged low MNB → ECB', witness(M(260), E(363)), E(363));
is('ECB alone → ECB', witness(null, E(363)), E(363));
is('MNB alone, near reference → MNB', witness(M(366), null), M(366));
is('MNB alone, 10% off reference → none', witness(M(402), null), null);
is('neither → none', witness(null, null), null);

/* Erste's buying rate is meant to sit 3.5% under the market, so it is never
   compared with the witness directly — its middle rate is. */
console.log('\nWhether to serve Erste');
const X = function (buy, middle) { return { rate: buy, middle: middle, date: '2026-11-13', source: 'Erste Bank cash buying' }; };
const today = X(352.75, 365.54);

is('middle agrees with MNB → Erste buying rate', pick(today, M(364.92), E(364.6)), today);
is('the buying rate itself is 3.5% under MNB, and that is fine', pick(today, M(364.92), null), today);
is('middle agrees with the ECB alone → Erste', pick(today, null, E(364.6)), today);
is('middle 1.9% off the witness → still Erste', pick(X(359.4, 372.0), M(365), null).rate, 359.4);
is('middle 3% off the witness → refused', pick(X(363.2, 376.4), M(365.4), E(365.2)), null);
is('a feed that halved its numbers → refused', pick(X(260, 270), M(364.92), E(364.6)), null);
is('witness is the ECB when MNB disagrees, and Erste agrees with it', pick(today, M(395), E(364.6)), today);
is('no witness, middle near reference → Erste', pick(today, null, null), today);
is('no witness, middle 8% off reference → refused', pick(X(381, 395), null, null), null);
is('Erste unavailable → null, never MNB', pick(null, M(364.92), E(364.6)), null);
is('nothing at all → null', pick(null, null, null), null);

if (process.argv.includes('--live')) {
  console.log('\nLive sources');
  const { default: handler } = await import('../netlify/functions/rate.mjs');
  const res = await handler();
  const body = await res.json();
  console.log('  handler → ' + JSON.stringify(body));
  console.log('  cache-control: ' + res.headers.get('cache-control'));
  if (body.rate === null) { fail++; console.log('  FAIL  no rate served — Erste unreachable, malformed, or contradicted'); }
  else { pass++; console.log('  ok    ' + body.source + ' rate ' + body.rate + ' for ' + body.date); }
  is('the answer carries only what the page needs', Object.keys(body).sort(), ['date', 'rate', 'source']);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
