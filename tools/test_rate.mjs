/* Checks netlify/functions/rate.mjs without deploying it.
 *
 *   node tools/test_rate.mjs          parsing and bounds, offline
 *   node tools/test_rate.mjs --live   also calls MNB and the ECB for real
 *
 * The offline part is the one that matters: it pins the two awkward details of
 * the MNB payload (XML escaped as text, Hungarian decimal comma) and the
 * refusal to trust a number outside sane bounds.
 */
import { parseMnb, parseEcb } from '../netlify/functions/rate.mjs';

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

if (process.argv.includes('--live')) {
  console.log('\nLive sources');
  const { default: handler } = await import('../netlify/functions/rate.mjs');
  const res = await handler();
  const body = await res.json();
  console.log('  handler → ' + JSON.stringify(body));
  console.log('  cache-control: ' + res.headers.get('cache-control'));
  if (body.rate === null) { fail++; console.log('  FAIL  both sources unreachable'); }
  else { pass++; console.log('  ok    ' + body.source + ' answered ' + body.rate + ' for ' + body.date); }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
