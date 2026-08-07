/**
 * The DSA HERO database schema.
 *
 * Real SQLite, running in the browser via WebAssembly. `problem` and `topic`
 * mirror the curriculum so the SQL console can join your attempts against
 * them — the whole point of using SQL here rather than a key/value store.
 */
export const SCHEMA_VERSION = 1;

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---- curriculum (rebuilt from the JS data on every boot) ----------------
CREATE TABLE IF NOT EXISTS topic (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  stage    TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS problem (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  topic      TEXT NOT NULL REFERENCES topic(id),
  pattern    TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  faang_freq INTEGER NOT NULL DEFAULT 0,
  position   INTEGER NOT NULL,
  url        TEXT
);

-- ---- your data (never dropped) -------------------------------------------
CREATE TABLE IF NOT EXISTS attempt (
  id              TEXT PRIMARY KEY,
  problem_id      TEXT NOT NULL,
  attempted_on    TEXT NOT NULL,
  outcome         TEXT NOT NULL,
  minutes         INTEGER NOT NULL DEFAULT 0,
  hints           INTEGER NOT NULL DEFAULT 0,
  tries           INTEGER NOT NULL DEFAULT 1,
  viewed_solution INTEGER NOT NULL DEFAULT 0,
  notes           TEXT    NOT NULL DEFAULT '',
  mode            TEXT    NOT NULL DEFAULT 'practice',
  created_at      TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempt_date    ON attempt(attempted_on);
CREATE INDEX IF NOT EXISTS idx_attempt_problem ON attempt(problem_id);
CREATE INDEX IF NOT EXISTS idx_attempt_outcome ON attempt(outcome);

CREATE TABLE IF NOT EXISTS attempt_mistake (
  attempt_id TEXT NOT NULL REFERENCES attempt(id) ON DELETE CASCADE,
  mistake    TEXT NOT NULL,
  PRIMARY KEY (attempt_id, mistake)
);

CREATE TABLE IF NOT EXISTS revision (
  problem_id TEXT PRIMARY KEY,
  box        INTEGER NOT NULL DEFAULT 0,
  due_on     TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revision_due ON revision(due_on);

CREATE TABLE IF NOT EXISTS plan (
  plan_date    TEXT PRIMARY KEY,
  kind         TEXT,
  generated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_item (
  plan_date  TEXT    NOT NULL REFERENCES plan(plan_date) ON DELETE CASCADE,
  slot       INTEGER NOT NULL,
  problem_id TEXT    NOT NULL,
  role       TEXT    NOT NULL DEFAULT 'new',
  reason     TEXT    NOT NULL DEFAULT '',
  PRIMARY KEY (plan_date, slot)
);

CREATE TABLE IF NOT EXISTS setting (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---- a view worth reading, and a worked example of a join ---------------
CREATE VIEW IF NOT EXISTS v_solved AS
SELECT a.id, a.attempted_on, a.outcome, a.minutes, a.hints,
       p.id AS problem_id, p.title, p.topic, p.pattern, p.difficulty
FROM   attempt a
JOIN   problem p ON p.id = a.problem_id
WHERE  a.outcome LIKE 'solved%';
`;

/** Handy starting points for the SQL console. */
export const EXAMPLE_QUERIES = [
  {
    name: 'Everything I have solved',
    sql: 'SELECT attempted_on, title, difficulty, minutes\nFROM v_solved\nORDER BY attempted_on DESC;',
  },
  {
    name: 'Solved per topic',
    sql: 'SELECT topic, COUNT(*) AS solved\nFROM v_solved\nGROUP BY topic\nORDER BY solved DESC;',
  },
  {
    name: 'My accuracy by difficulty',
    sql: `SELECT p.difficulty,
       COUNT(*)                                             AS attempts,
       SUM(CASE WHEN a.outcome LIKE 'solved%' THEN 1 END)   AS solved,
       ROUND(100.0 * SUM(CASE WHEN a.outcome LIKE 'solved%' THEN 1 END)
             / COUNT(*), 1)                                 AS pct
FROM   attempt a
JOIN   problem p ON p.id = a.problem_id
GROUP  BY p.difficulty;`,
  },
  {
    name: 'Problems that cost me hints',
    sql: 'SELECT title, pattern, hints, minutes\nFROM v_solved\nWHERE hints > 0\nORDER BY hints DESC;',
  },
  {
    name: 'Which patterns am I weakest at?',
    sql: `SELECT p.pattern,
       COUNT(*) AS tried,
       SUM(CASE WHEN a.outcome = 'failed' THEN 1 ELSE 0 END) AS failed
FROM   attempt a
JOIN   problem p ON p.id = a.problem_id
GROUP  BY p.pattern
HAVING failed > 0
ORDER  BY failed DESC;`,
  },
  {
    name: 'What is due for a re-solve',
    sql: 'SELECT r.due_on, r.box, p.title, p.difficulty\nFROM revision r\nJOIN problem p ON p.id = r.problem_id\nORDER BY r.due_on;',
  },
  {
    name: 'The whole curriculum, by topic',
    sql: `SELECT t.position, t.name AS topic, COUNT(p.id) AS problems,
       SUM(CASE WHEN p.difficulty = 'easy'   THEN 1 ELSE 0 END) AS easy,
       SUM(CASE WHEN p.difficulty = 'medium' THEN 1 ELSE 0 END) AS medium,
       SUM(CASE WHEN p.difficulty = 'hard'   THEN 1 ELSE 0 END) AS hard
FROM   topic t
LEFT   JOIN problem p ON p.topic = t.id
GROUP  BY t.id
ORDER  BY t.position;`,
  },
];
