/**
 * Logbook merge test.
 *
 * The merge runs on every boot, so the property that actually matters is that
 * it is idempotent: a hundred page loads must leave exactly one row per entry.
 * The second property is that it never touches what is already there, because
 * an attempt logged by hand in Practice must outrank the repo's copy of it.
 *
 * The merge itself talks to the live database module, which needs IndexedDB.
 * Rather than fake a browser, this reimplements the same insert-if-missing rule
 * against real SQLite and checks the shape of the shipped logbook.json against
 * the real curriculum — which is where a wrong problemId or a typo'd outcome
 * would actually bite.
 *
 * Run with: npm run test:logbook
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');
const wasmBinary = readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { SCHEMA } = await vite.ssrLoadModule('/src/db/schema.js');
const { PROBLEM_BY_ID } = await vite.ssrLoadModule('/src/data/problems.js');
const { OUTCOME_BY_ID } = await vite.ssrLoadModule('/src/data/mistakes.js');
const { BOX_DAYS } = await vite.ssrLoadModule('/src/store/defaults.js');
const { addDays } = await vite.ssrLoadModule('/src/lib/date.js');
await vite.close();

const SQL = await initSqlJs({ wasmBinary });
const logbook = JSON.parse(readFileSync(new URL('../public/logbook.json', import.meta.url), 'utf8'));

const checks = [];
const check = (name, ok, detail) => checks.push([name, Boolean(ok), detail]);

// ---- the shipped logbook is valid against the real curriculum ----------
const entries = logbook.attempts ?? [];
check('logbook.json has attempts', entries.length > 0, `found ${entries.length}`);

const ids = entries.map((e) => e.id);
check('attempt ids are unique', new Set(ids).size === ids.length);

for (const e of entries) {
  check(`${e.id}: problemId "${e.problemId}" is real`, Boolean(PROBLEM_BY_ID[e.problemId]));
  check(`${e.id}: outcome "${e.outcome}" is known`, Boolean(OUTCOME_BY_ID[e.outcome]));
  check(`${e.id}: date is YYYY-MM-DD`, /^\d{4}-\d{2}-\d{2}$/.test(e.date ?? ''));
  check(`${e.id}: code is present`, typeof e.code === 'string' && e.code.length > 0);
  // A clean solve claims no hints were used; the two must not contradict.
  const consistent = e.outcome !== 'solved-clean' || (e.hints ?? 0) === 0;
  check(`${e.id}: solved-clean implies zero hints`, consistent);
}

// ---- the merge rule, against real SQLite -------------------------------
const db = new SQL.Database();
db.run(SCHEMA);

/** Mirrors mergeLogbook: insert only ids the database has not seen. */
function merge(rows) {
  const known = new Set(db.exec('SELECT id FROM attempt')[0]?.values.flat() ?? []);
  let merged = 0;
  for (const e of [...rows].sort((a, b) => a.date.localeCompare(b.date))) {
    if (known.has(e.id)) continue;
    const prev = db.exec('SELECT box FROM revision WHERE problem_id = ?', [e.problemId])[0];
    const prevBox = prev ? prev.values[0][0] : -1;
    const box = e.outcome === 'solved-clean' ? Math.min(prevBox + 1, BOX_DAYS.length - 1) : 0;
    db.run(
      `INSERT INTO attempt (id, problem_id, attempted_on, outcome, minutes, hints,
         tries, viewed_solution, notes, code, language, mode, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [e.id, e.problemId, e.date, e.outcome, e.minutes ?? 0, e.hints ?? 0, e.tries ?? 1,
       e.viewedSolution ? 1 : 0, e.notes ?? '', e.code ?? '', e.language ?? 'java',
       'practice', new Date().toISOString()]
    );
    db.run('INSERT OR REPLACE INTO revision (problem_id, box, due_on) VALUES (?,?,?)', [
      e.problemId, box, addDays(e.date, BOX_DAYS[box]),
    ]);
    known.add(e.id);
    merged += 1;
  }
  return merged;
}

const first = merge(entries);
check('first merge inserts every entry', first === entries.length, `${first} of ${entries.length}`);

const second = merge(entries);
check('second merge inserts nothing', second === 0, `inserted ${second}`);
merge(entries);

const total = db.exec('SELECT COUNT(*) FROM attempt')[0].values[0][0];
check('three merges leave one row per entry', total === entries.length, `${total} rows`);

// ---- a hand-logged attempt is never overwritten ------------------------
const target = entries[0];
db.run('DELETE FROM attempt');
db.run('DELETE FROM revision');
db.run(
  `INSERT INTO attempt (id, problem_id, attempted_on, outcome, minutes, hints,
     tries, viewed_solution, notes, code, language, mode, created_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  [target.id, target.problemId, target.date, 'failed', 99, 3, 4, 1, 'logged by hand',
   'mine', 'java', 'practice', new Date().toISOString()]
);
merge(entries);
const kept = db.exec('SELECT outcome, notes FROM attempt WHERE id = ?', [target.id])[0].values[0];
check('an existing id is left untouched', kept[0] === 'failed' && kept[1] === 'logged by hand');

// ---- the Leitner box advances on repeat clean solves -------------------
db.run('DELETE FROM attempt');
db.run('DELETE FROM revision');
const pid = target.problemId;
merge([
  { id: 'x1', problemId: pid, date: '2026-01-01', outcome: 'solved-clean', code: 'a' },
  { id: 'x2', problemId: pid, date: '2026-01-02', outcome: 'solved-clean', code: 'a' },
]);
const box = db.exec('SELECT box FROM revision WHERE problem_id = ?', [pid])[0].values[0][0];
check('two clean solves promote to box 1', box === 1, `box ${box}`);

merge([{ id: 'x3', problemId: pid, date: '2026-01-03', outcome: 'failed', code: 'a' }]);
const reset = db.exec('SELECT box FROM revision WHERE problem_id = ?', [pid])[0].values[0][0];
check('a miss resets to box 0', reset === 0, `box ${reset}`);

db.close();

// ---- base64 round-trip for the GitHub Contents API ---------------------
// The API takes base64, and btoa is byte-oriented, so anything non-ASCII in a
// note is where this silently corrupts or throws.
{
  const { encode, decode } = await (async () => {
    const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
    const mod = await v.ssrLoadModule('/src/db/github.js');
    await v.close();
    return mod;
  })();

  const samples = [
    'plain ascii',
    'em dash — and ellipsis …',
    'O(n²) time, O(1) space',
    'code with "quotes"\n\tand a tab\n',
    '🎯 emoji survive too',
    JSON.stringify(logbook, null, 2),
  ];
  for (const s of samples) {
    const label = s.length > 28 ? `${s.slice(0, 28)}…` : s;
    check(`base64 round-trip: ${JSON.stringify(label)}`, decode(encode(s)) === s);
  }

  // A payload large enough to have blown the stack before chunking.
  const big = 'x'.repeat(300_000);
  check('base64 handles a large payload', decode(encode(big)) === big);
}

let failed = 0;
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
}
console.log(failed ? `\n${failed} of ${checks.length} check(s) failed.` : `\nAll ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
