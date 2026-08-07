import { query, run, transaction } from './database';
import { todayKey } from '../lib/date';

const LEGACY_KEY = 'dsa-hero-state-v1';

const DEFAULT_SETTINGS = {
  startedOn: todayKey(),
  goals: { weekday: 2, weekend: 4 },
  profile: { name: 'DSA Hero' },
  seenAchievements: [],
};

function readSettings() {
  const rows = query('SELECT key, value FROM setting');
  const out = { ...DEFAULT_SETTINGS };
  for (const { key, value } of rows) {
    try {
      out[key] = JSON.parse(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export function putSetting(key, value) {
  run('INSERT OR REPLACE INTO setting (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
}

/** Rebuilds the in-memory state object the engine and pages already expect. */
export function loadState() {
  const settings = readSettings();

  const attemptRows = query('SELECT * FROM attempt ORDER BY created_at, id');
  const mistakeRows = query('SELECT attempt_id, mistake FROM attempt_mistake');
  const mistakesByAttempt = new Map();
  for (const { attempt_id, mistake } of mistakeRows) {
    const list = mistakesByAttempt.get(attempt_id) ?? [];
    list.push(mistake);
    mistakesByAttempt.set(attempt_id, list);
  }

  const attempts = attemptRows.map((r) => ({
    id: r.id,
    problemId: r.problem_id,
    date: r.attempted_on,
    outcome: r.outcome,
    minutes: r.minutes,
    hints: r.hints,
    tries: r.tries,
    viewedSolution: Boolean(r.viewed_solution),
    notes: r.notes,
    mode: r.mode,
    mistakes: mistakesByAttempt.get(r.id) ?? [],
  }));

  const revisions = {};
  for (const r of query('SELECT * FROM revision')) {
    revisions[r.problem_id] = { box: r.box, due: r.due_on };
  }

  const plans = {};
  for (const p of query('SELECT * FROM plan')) {
    const items = query('SELECT * FROM plan_item WHERE plan_date = ? ORDER BY slot', [p.plan_date]);
    plans[p.plan_date] = {
      kind: p.kind,
      generatedAt: p.generated_at,
      problemIds: items.map((i) => i.problem_id),
      roles: items.map((i) => i.role),
      reasons: items.map((i) => i.reason),
    };
  }

  return {
    version: 1,
    startedOn: settings.startedOn,
    goals: settings.goals,
    profile: settings.profile,
    seenAchievements: settings.seenAchievements,
    attempts,
    revisions,
    plans,
  };
}

export function insertAttempt(attempt, revision) {
  transaction(() => {
    run(
      `INSERT INTO attempt
         (id, problem_id, attempted_on, outcome, minutes, hints, tries,
          viewed_solution, notes, mode, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        attempt.id,
        attempt.problemId,
        attempt.date,
        attempt.outcome,
        attempt.minutes,
        attempt.hints,
        attempt.tries,
        attempt.viewedSolution ? 1 : 0,
        attempt.notes,
        attempt.mode,
        new Date().toISOString(),
      ]
    );
    for (const m of attempt.mistakes ?? []) {
      run('INSERT OR IGNORE INTO attempt_mistake (attempt_id, mistake) VALUES (?, ?)', [
        attempt.id,
        m,
      ]);
    }
    if (revision) {
      run('INSERT OR REPLACE INTO revision (problem_id, box, due_on) VALUES (?,?,?)', [
        attempt.problemId,
        revision.box,
        revision.due,
      ]);
    }
  });
}

export function updateNote(attemptId, notes) {
  run('UPDATE attempt SET notes = ? WHERE id = ?', [notes, attemptId]);
}

export function deleteAttempt(attemptId) {
  transaction(() => {
    run('DELETE FROM attempt_mistake WHERE attempt_id = ?', [attemptId]);
    run('DELETE FROM attempt WHERE id = ?', [attemptId]);
  });
}

export function savePlan(dateKey, items, kind) {
  transaction(() => {
    run('DELETE FROM plan_item WHERE plan_date = ?', [dateKey]);
    run('INSERT OR REPLACE INTO plan (plan_date, kind, generated_at) VALUES (?,?,?)', [
      dateKey,
      kind ?? null,
      new Date().toISOString(),
    ]);
    items.forEach((item, slot) => {
      run(
        'INSERT INTO plan_item (plan_date, slot, problem_id, role, reason) VALUES (?,?,?,?,?)',
        [dateKey, slot, item.problemId, item.role ?? 'new', item.reason ?? '']
      );
    });
  });
}

/**
 * One-time lift of any pre-SQLite localStorage state into the database.
 * Runs only when the attempt table is empty, so it can never double-import.
 */
export function migrateLegacyState() {
  const [{ n }] = query('SELECT COUNT(*) AS n FROM attempt');
  if (n > 0) return false;

  let legacy;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return false;
    legacy = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!legacy || !Array.isArray(legacy.attempts) || legacy.attempts.length === 0) return false;

  transaction(() => {
    for (const a of legacy.attempts) {
      run(
        `INSERT OR IGNORE INTO attempt
           (id, problem_id, attempted_on, outcome, minutes, hints, tries,
            viewed_solution, notes, mode, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
          a.id,
          a.problemId,
          a.date,
          a.outcome,
          a.minutes ?? 0,
          a.hints ?? 0,
          a.tries ?? 1,
          a.viewedSolution ? 1 : 0,
          a.notes ?? '',
          a.mode ?? 'practice',
          new Date().toISOString(),
        ]
      );
      for (const m of a.mistakes ?? []) {
        run('INSERT OR IGNORE INTO attempt_mistake (attempt_id, mistake) VALUES (?, ?)', [a.id, m]);
      }
    }
    for (const [pid, r] of Object.entries(legacy.revisions ?? {})) {
      run('INSERT OR REPLACE INTO revision (problem_id, box, due_on) VALUES (?,?,?)', [
        pid,
        r.box ?? 0,
        r.due,
      ]);
    }
    if (legacy.goals) putSetting('goals', legacy.goals);
    if (legacy.profile) putSetting('profile', legacy.profile);
    if (legacy.startedOn) putSetting('startedOn', legacy.startedOn);
  });

  localStorage.setItem(`${LEGACY_KEY}-migrated`, new Date().toISOString());
  return true;
}
