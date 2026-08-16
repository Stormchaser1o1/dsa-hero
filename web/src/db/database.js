import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { PROBLEMS } from '../data/problems';
import { TOPICS } from '../data/topics';
import { ADDED_COLUMNS, SCHEMA, SCHEMA_VERSION } from './schema';
import { clearFile, readFile, writeFile } from './idb';

let db = null;
let saveTimer = 0;

export function isOpen() {
  return db !== null;
}

/**
 * True only in an environment that can both run the wasm build and persist
 * the result. Checked before touching sql.js because its loader aborts the
 * whole process — not a catchable rejection — when it cannot find the wasm.
 */
export function isSupported() {
  return typeof indexedDB !== 'undefined' && typeof WebAssembly !== 'undefined';
}

/** Opens the file from IndexedDB (or creates it), applies the schema and
 *  refreshes the curriculum tables. Safe to call once at boot. */
export async function openDatabase() {
  if (!isSupported()) throw new Error('IndexedDB is not available in this browser');
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const bytes = await readFile();
  db = bytes ? new SQL.Database(new Uint8Array(bytes)) : new SQL.Database();

  db.run(SCHEMA);
  migrate();
  db.run("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', ?)", [
    String(SCHEMA_VERSION),
  ]);
  seedCurriculum();
  return db;
}

/** Brings a database created by an older schema up to the current one. */
function migrate() {
  for (const { table, column, ddl } of ADDED_COLUMNS) {
    const cols = db.exec(`PRAGMA table_info(${table})`)[0];
    if (!cols) continue;
    const names = cols.values.map((row) => row[cols.columns.indexOf('name')]);
    if (names.includes(column)) continue;
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

/** The curriculum is code, not user data — rewrite it on every boot so
 *  editing problems.js is enough to update the tables. */
function seedCurriculum() {
  db.run('BEGIN');
  try {
    db.run('DELETE FROM problem');
    db.run('DELETE FROM topic');

    const topicStmt = db.prepare('INSERT INTO topic (id, name, stage, position) VALUES (?,?,?,?)');
    TOPICS.forEach((t, i) => topicStmt.run([t.id, t.name, t.stage, i + 1]));
    topicStmt.free();

    const probStmt = db.prepare(
      `INSERT INTO problem (id, title, topic, pattern, difficulty, faang_freq, position, url)
       VALUES (?,?,?,?,?,?,?,?)`
    );
    for (const p of PROBLEMS) {
      probStmt.run([p.id, p.title, p.topic, p.pattern, p.difficulty, p.faangFreq, p.order, p.url]);
    }
    probStmt.free();
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
}

/** Rows as plain objects, the shape every caller actually wants. */
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

export function run(sql, params = []) {
  db.run(sql, params);
  scheduleSave();
}

export function transaction(fn) {
  db.run('BEGIN');
  try {
    fn();
    db.run('COMMIT');
  } catch (err) {
    db.run('ROLLBACK');
    throw err;
  }
  scheduleSave();
}

/** Raw handle for the SQL console — returns sql.js's column/values result. */
export function exec(sql) {
  return db.exec(sql);
}

export function exportBytes() {
  return db.export();
}

export async function importBytes(bytes) {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  const next = new SQL.Database(new Uint8Array(bytes));
  // Fail before replacing the live handle if the file is not one of ours.
  next.exec('SELECT COUNT(*) FROM attempt');
  db?.close();
  db = next;
  db.run(SCHEMA);
  migrate();
  seedCurriculum();
  await save();
}

export async function resetDatabase() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  db?.close();
  db = new SQL.Database();
  db.run(SCHEMA);
  seedCurriculum();
  await clearFile();
  await save();
}

/** Writes are batched — a burst of statements costs one IndexedDB write. */
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    save().catch((err) => console.warn('DSA HERO: could not persist database —', err.message));
  }, 250);
}

export async function save() {
  if (!db) return;
  await writeFile(db.export());
}
