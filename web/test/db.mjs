/**
 * Database test — runs the real schema through real SQLite (the same wasm
 * build the browser uses), exercises every example query, and checks the
 * round-trip through export/import.
 *
 * Run with: npm run test:db
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');
const wasmBinary = readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { SCHEMA, EXAMPLE_QUERIES } = await vite.ssrLoadModule('/src/db/schema.js');
const { PROBLEMS } = await vite.ssrLoadModule('/src/data/problems.js');
const { TOPICS } = await vite.ssrLoadModule('/src/data/topics.js');
await vite.close();

const SQL = await initSqlJs({ wasmBinary });

const checks = [];
const check = (name, ok, detail) => {
  checks.push([name, Boolean(ok), detail]);
};

// ---- schema applies cleanly -------------------------------------------
let db;
try {
  db = new SQL.Database();
  db.run(SCHEMA);
  check('schema executes without error', true);
} catch (err) {
  check('schema executes without error', false, err.message);
  report();
}

// Applying twice must be a no-op (every object uses IF NOT EXISTS).
try {
  db.run(SCHEMA);
  check('schema is idempotent', true);
} catch (err) {
  check('schema is idempotent', false, err.message);
}

const tables = db
  .exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0]
  .values.flat();
for (const t of ['attempt', 'attempt_mistake', 'meta', 'plan', 'plan_item', 'problem', 'revision', 'setting', 'topic']) {
  check(`table ${t} exists`, tables.includes(t));
}
const views = db.exec("SELECT name FROM sqlite_master WHERE type='view'")[0]?.values.flat() ?? [];
check('view v_solved exists', views.includes('v_solved'));

// ---- seed the curriculum, exactly as database.js does ------------------
db.run('BEGIN');
const tStmt = db.prepare('INSERT INTO topic (id, name, stage, position) VALUES (?,?,?,?)');
TOPICS.forEach((t, i) => tStmt.run([t.id, t.name, t.stage, i + 1]));
tStmt.free();
const pStmt = db.prepare(
  'INSERT INTO problem (id, title, topic, pattern, difficulty, faang_freq, position, url) VALUES (?,?,?,?,?,?,?,?)'
);
for (const p of PROBLEMS) {
  pStmt.run([p.id, p.title, p.topic, p.pattern, p.difficulty, p.faangFreq, p.order, p.url]);
}
pStmt.free();
db.run('COMMIT');

const count = (sql) => db.exec(sql)[0].values[0][0];
check(`all ${TOPICS.length} topics seeded`, count('SELECT COUNT(*) FROM topic') === TOPICS.length);
check(`all ${PROBLEMS.length} problems seeded`, count('SELECT COUNT(*) FROM problem') === PROBLEMS.length);
check(
  'every problem references a real topic',
  count('SELECT COUNT(*) FROM problem p LEFT JOIN topic t ON t.id = p.topic WHERE t.id IS NULL') === 0
);
check(
  'difficulty CHECK constraint is enforced',
  (() => {
    try {
      db.run("INSERT INTO problem (id,title,topic,pattern,difficulty,faang_freq,position) VALUES ('x','x','arrays','x','impossible',0,0)");
      return false;
    } catch {
      return true;
    }
  })()
);

// ---- write some attempts ------------------------------------------------
const attempts = [
  ['a1', 'logic-1', '2026-08-07', 'solved-clean', 11, 0, 1, 0, 'Nested loops clicked.'],
  ['a2', 'logic-2', '2026-08-07', 'solved-hints', 19, 2, 2, 0, 'Order of the checks matters.'],
  ['a3', 'arrays-11', '2026-08-08', 'failed', 31, 3, 1, 1, 'Kadane still not intuitive.'],
];
db.run('BEGIN');
const aStmt = db.prepare(
  `INSERT INTO attempt (id, problem_id, attempted_on, outcome, minutes, hints, tries, viewed_solution, notes, mode, created_at)
   VALUES (?,?,?,?,?,?,?,?,?, 'practice', datetime('now'))`
);
attempts.forEach((row) => aStmt.run(row));
aStmt.free();
db.run("INSERT INTO attempt_mistake (attempt_id, mistake) VALUES ('a3','pattern'), ('a3','optimization')");
db.run("INSERT INTO revision (problem_id, box, due_on) VALUES ('logic-1', 1, '2026-08-10')");
db.run("INSERT INTO setting (key, value) VALUES ('goals', '{\"weekday\":2,\"weekend\":4}')");
db.run("INSERT INTO plan (plan_date, kind, generated_at) VALUES ('2026-08-07','weekday',datetime('now'))");
db.run("INSERT INTO plan_item (plan_date, slot, problem_id, role, reason) VALUES ('2026-08-07',0,'logic-1','new','First one'), ('2026-08-07',1,'logic-2','new','Second one')");
db.run('COMMIT');

check('3 attempts stored', count('SELECT COUNT(*) FROM attempt') === 3);
check('v_solved excludes failures', count('SELECT COUNT(*) FROM v_solved') === 2);
check('mistakes linked to their attempt', count("SELECT COUNT(*) FROM attempt_mistake WHERE attempt_id='a3'") === 2);
check('plan items ordered by slot', db.exec("SELECT problem_id FROM plan_item WHERE plan_date='2026-08-07' ORDER BY slot")[0].values.flat().join(',') === 'logic-1,logic-2');

// Cascade only fires with foreign_keys ON, which the schema sets.
db.run('PRAGMA foreign_keys = ON');
db.run("DELETE FROM plan WHERE plan_date='2026-08-07'");
check('deleting a plan cascades to its items', count('SELECT COUNT(*) FROM plan_item') === 0);

// ---- every documented example query must run ---------------------------
for (const q of EXAMPLE_QUERIES) {
  try {
    db.exec(q.sql);
    check(`example query runs: ${q.name}`, true);
  } catch (err) {
    check(`example query runs: ${q.name}`, false, err.message);
  }
}

// A join across your data and the curriculum — the reason SQL is worth it.
const perTopic = db.exec("SELECT topic, COUNT(*) FROM v_solved GROUP BY topic")[0];
check('join across attempt and problem works', perTopic.values.length === 1 && perTopic.values[0][1] === 2);

// ---- export / import round-trip ----------------------------------------
const bytes = db.export();
check('export produces a SQLite file', bytes.length > 1000 && new TextDecoder().decode(bytes.slice(0, 15)) === 'SQLite format 3');

const reopened = new SQL.Database(bytes);
check('reopened file keeps the attempts', reopened.exec('SELECT COUNT(*) FROM attempt')[0].values[0][0] === 3);
check('reopened file keeps the notes', reopened.exec("SELECT notes FROM attempt WHERE id='a1'")[0].values[0][0] === 'Nested loops clicked.');

report();

function report() {
  let failed = 0;
  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` — ${detail}` : ''}`);
    if (!ok) failed++;
  }
  console.log(failed ? `\n${failed} of ${checks.length} check(s) failed.` : `\nAll ${checks.length} checks passed.`);
  process.exit(failed ? 1 : 0);
}
