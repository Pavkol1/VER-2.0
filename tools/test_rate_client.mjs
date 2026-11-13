/* Checks the rate layer of Ver3/room-service.html — the half of the euro rate
 * that runs in the guest's browser.
 *
 *   node tools/test_rate_client.mjs            the page as it is on disk
 *   node tools/test_rate_client.mjs <file>     another copy of the page
 *
 * tools/test_rate.mjs covers the function; it could not see either defect
 * found on 2026-11-10, because both lived here: a stored entry stamped today
 * suppressed the request to /api/rate for the rest of the day, whether the
 * entry held a rate published yesterday or no usable rate at all.
 *
 * Nothing is copied. The code between the rate-layer markers is lifted out of
 * the page and run in a vm sandbox with a fake localStorage, fetch and clock,
 * so what is tested is what ships.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || path.join(here, '..', 'Ver3', 'room-service.html');
const html = fs.readFileSync(file, 'utf8');

const a = html.indexOf('/* rate-layer:begin');
const b = html.indexOf('/* rate-layer:end */');
if (a < 0 || b < a) { console.error('rate-layer markers not found in ' + file); process.exit(1); }
const layer = html.slice(a, b);
const num = name => Number(html.match(new RegExp('var ' + name + ' = ([\\d.]+);'))[1]);
const FALLBACK = num('FALLBACK'), SPREAD = num('SPREAD');

let pass = 0, fail = 0;
function is (label, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log('  ok    ' + label); }
  else { fail++; console.log('  FAIL  ' + label + '\n          got  ' + JSON.stringify(got) + '\n          want ' + JSON.stringify(want)); }
}
const tick = () => new Promise(r => setImmediate(r));

const DAY = 86400000;
const NOW = Date.parse('2026-11-10T08:00:00+01:00');   /* a morning, before MNB publishes */
const KEY = 'rs-eur-rate';

/* One page load. `stored` is what localStorage holds going in; `api` decides
   how /api/rate behaves: an object is the JSON body, 'down' rejects, 'http500'
   answers not-ok. The response is held back until answer() is called, so a
   test can act in the gap — which is where the tray gets filled. */
function load ({ stored, api, storageThrows = false } = {}) {
  const store = new Map();
  if (stored !== undefined) store.set(KEY, typeof stored === 'string' ? stored : JSON.stringify(stored));
  let release, asked = 0;
  const gate = new Promise(r => { release = r; });
  const ctx = vm.createContext({
    FALLBACK, SPREAD, repaints: 0,
    repaint () { ctx.repaints++; },
    localStorage: {
      getItem (k) { if (storageThrows) throw new Error('denied'); return store.has(k) ? store.get(k) : null; },
      setItem (k, v) { if (storageThrows) throw new Error('denied'); store.set(k, String(v)); }
    },
    fetch () {
      asked++;
      return gate.then(() => {
        if (api === 'down') throw new Error('network');
        if (api === 'http500') return { ok: false, json: async () => ({}) };
        return { ok: true, json: async () => api };
      });
    }
  });
  vm.runInContext('Date.now = function () { return ' + NOW + '; };', ctx);
  vm.runInContext(layer, ctx);
  return {
    ctx,
    asked: () => asked,
    cached: () => (store.has(KEY) ? JSON.parse(store.get(KEY)) : null),
    answer: async () => { release(); await tick(); await tick(); }
  };
}

/* ── readCache: what a stored entry has to prove ─────────────── */
const rc = load({ api: 'down' }).ctx.readCache;
const good = { rate: 370, date: '2026-11-07', source: 'MNB', ts: NOW - 3600000 };
const read = (o, now = NOW) => rc(typeof o === 'string' || o === null ? o : JSON.stringify(o), now);
const used = o => read(o) !== null;

is('a valid entry is read back field for field', read(good), good);
is('nothing stored',                      read(null), null);
is('malformed JSON',                      read('{broken'), null);
is('JSON that is not an object',          [read('370'), read('"x"'), read('[]'), read('null')], [null, null, null, null]);

is('ts missing — the pre-2026-11-10 format', used({ rate: 370, date: '2026-11-07', source: 'MNB', day: '2026-11-10' }), false);
is('ts a string',                         used({ ...good, ts: String(NOW - 1000) }), false);
is('ts null',                             used({ ...good, ts: null }), false);
is('ts zero',                             used({ ...good, ts: 0 }), false);
is('ts negative',                         used({ ...good, ts: -5 }), false);
is('ts not a finite number',              read('{"rate":370,"ts":1e999}'), null);
is('ts one millisecond in the future',    used({ ...good, ts: NOW + 1 }), false);
is('ts far in the future',                used({ ...good, ts: NOW + 400 * DAY }), false);
is('ts exactly now',                      used({ ...good, ts: NOW }), true);
is('ts exactly at the age limit',         used({ ...good, ts: NOW - 7 * DAY }), true);
is('ts one millisecond past the limit',   used({ ...good, ts: NOW - 7 * DAY - 1 }), false);

is('rate 0',                              used({ ...good, rate: 0 }), false);
is('rate null',                           used({ ...good, rate: null }), false);
is('rate a numeric string',               used({ ...good, rate: '370' }), false);
is('rate absurdly high',                  used({ ...good, rate: 1e9 }), false);
is('rate just under the lower bound',     used({ ...good, rate: 249.99 }), false);
is('rate on the bounds',                  [used({ ...good, rate: 250 }), used({ ...good, rate: 500 })], [true, true]);

is('a date that is not a date is dropped, the rate kept',
   read({ ...good, date: '<b>yesterday</b>' }), { ...good, date: null });
is('a source with markup in it is dropped',
   read({ ...good, source: 'MNB <script>' }), { ...good, source: null });
is('a source longer than forty characters is dropped',
   read({ ...good, source: 'Erste Bank cash buying rate as published today' }), { ...good, source: null });
is('the Erste label is kept as written',
   read({ ...good, source: 'Erste Bank cash buying' }).source, 'Erste Bank cash buying');
is('fields the page did not write do not ride along',
   read({ ...good, day: '2026-11-10', note: 'x' }), good);

/* ── page load ───────────────────────────────────────────────── */
const TODAY_RATE = { rate: 364.5, date: '2026-11-10', source: 'MNB' };
const YDAY_RATE  = { rate: 363.18, date: '2026-11-09', source: 'MNB' };

{ /* first visit */
  const p = load({ api: YDAY_RATE });
  is('first visit: FALLBACK is on screen before the answer', [p.ctx.rate, p.ctx.rateInfo], [FALLBACK, null]);
  is('first visit: the API is asked', p.asked(), 1);
  await p.answer();
  is('first visit: the API rate is adopted and painted', [p.ctx.rate, p.ctx.repaints], [363.18, 1]);
  is('first visit: stored with the published date and the time received',
     p.cached(), { rate: 363.18, date: '2026-11-09', source: 'MNB', ts: NOW });
}

{ /* the first defect: a fresh entry used to silence the request until midnight */
  const morning = { rate: 363.18, date: '2026-11-09', source: 'MNB', ts: NOW - 2 * 3600000 };
  const p = load({ stored: morning, api: TODAY_RATE });
  is('fresh cache: used for the first paint', [p.ctx.rate, p.ctx.rateInfo.date], [363.18, '2026-11-09']);
  is('fresh cache: the API is asked all the same', p.asked(), 1);
  await p.answer();
  is('fresh cache: the rate published since then replaces the morning one',
     [p.ctx.rate, p.ctx.rateInfo.date, p.ctx.repaints], [364.5, '2026-11-10', 1]);
}

{ /* the second defect: rejected for pricing, yet it still suppressed the request */
  const p = load({ stored: { rate: 0, date: '2026-11-10', source: 'MNB', ts: NOW }, api: TODAY_RATE });
  is('unusable rate stamped now: not used', [p.ctx.rate, p.ctx.rateInfo], [FALLBACK, null]);
  is('unusable rate stamped now: the API is asked', p.asked(), 1);
  await p.answer();
  is('unusable rate stamped now: the page recovers', p.ctx.rate, 364.5);
}

{ /* an undated entry used to slip past the age limit */
  const p = load({ stored: { rate: 299, day: 'not-a-date' }, api: 'down' });
  await p.answer();
  is('undated entry, API down: FALLBACK prices the menu, not the stale 299', [p.ctx.rate, p.ctx.rateInfo], [FALLBACK, null]);
}

{
  const p = load({ stored: { ...good, ts: NOW + DAY }, api: 'down' });
  await p.answer();
  is('entry from the future, API down: ignored', p.ctx.rate, FALLBACK);
}

{
  const p = load({ stored: good, api: 'down' });
  await p.answer();
  is('API down: a valid cache stands, and is untouched', [p.ctx.rate, p.ctx.rateInfo.date, p.cached()], [370, '2026-11-07', good]);
}

{
  const p = load({ stored: good, api: 'http500' });
  await p.answer();
  is('API answers not-ok: a valid cache stands', [p.ctx.rate, p.cached()], [370, good]);
}

{
  const p = load({ stored: good, api: { rate: null, date: null, source: 'unavailable' } });
  await p.answer();
  is('API has no rate: nothing adopted, nothing stored over the good entry', [p.ctx.rate, p.cached()], [370, good]);
}

{
  const p = load({ stored: good, api: { rate: 36318, date: '2026-11-10', source: 'MNB' } });
  await p.answer();
  is('API rate out of bounds: refused', [p.ctx.rate, p.cached()], [370, good]);
}

{
  const p = load({ stored: { ...good, rate: 364.5 }, api: TODAY_RATE });
  await p.answer();
  is('API confirms the cached number: no repaint, but the published date moves on',
     [p.ctx.rate, p.ctx.repaints, p.ctx.rateInfo.date, p.cached().ts], [364.5, 0, '2026-11-10', NOW]);
}

{
  const p = load({ api: TODAY_RATE, storageThrows: true });
  await p.answer();
  is('storage unavailable: the API rate is still used', p.ctx.rate, 364.5);
}

/* ── the freeze: an order keeps the rate it was priced at ────── */
{
  const p = load({ stored: good, api: TODAY_RATE });
  p.ctx.rateLocked = true;                    /* what update() does on the first dish */
  await p.answer();
  is('dish added before the answer: prices do not move', [p.ctx.rate, p.ctx.repaints], [370, 0]);
  is('dish added before the answer: the order still reports the rate it used',
     [p.ctx.rateInfo.date, p.ctx.rateLabel()], ['2026-11-07', 'MNB rate of 2026-11-07']);
  is('dish added before the answer: the new rate is stored for the next visit',
     p.cached(), { ...TODAY_RATE, ts: NOW });
}

{
  const p = load({ api: TODAY_RATE });
  p.ctx.rateLocked = true;
  await p.answer();
  is('dish added on FALLBACK: the order says fallback, not the rate that arrived later',
     [p.ctx.rate, p.ctx.rateLabel()], [FALLBACK, 'fallback — the live rate was unavailable']);
}

/* ── what reception is told ──────────────────────────────────── */
{
  const p = load({ api: YDAY_RATE });        /* received on the 10th, published for the 9th */
  await p.answer();
  const label = p.ctx.rateLabel();
  is('the order names the day the rate was published for', label, 'MNB rate of 2026-11-09');
  is('the order does not name the day of the visit', label.includes('2026-11-10'), false);
}

{
  const p = load({ api: { rate: 352.75, date: '2026-11-13', source: 'Erste Bank cash buying' } });
  await p.answer();
  is('the Erste rate as reception reads it', p.ctx.rateLabel(), 'Erste Bank cash buying rate of 2026-11-13');
}

{
  const p = load({ api: { rate: 364.5, source: 'ECB' } });
  await p.answer();
  is('no published date: said so, not replaced by today', p.ctx.rateLabel(), 'ECB rate, date not stated');
}

is('effRate applies the buffer to whatever rate is held',
   load({ stored: good, api: 'down' }).ctx.effRate(), 370 / SPREAD);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
