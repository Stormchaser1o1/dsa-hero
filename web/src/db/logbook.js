/**
 * The logbook: attempts held outside the browser so they survive it.
 *
 * Progress lives in IndexedDB, which is per-browser, per-machine and gone the
 * moment site data is cleared. `logbook.json` is the durable copy. It is read
 * on boot and merged in, and written back whenever something changes.
 *
 * There are two sources, tried in order:
 *
 *   1. The GitHub API, when a token is configured. This is the live file on the
 *      branch, so a browser that has never seen this app restores everything,
 *      and a second device stays in step.
 *   2. `public/logbook.json` from the deployed build. No token needed, but it
 *      is only as fresh as the last `npm run deploy`.
 *
 * Merging is keyed on the attempt id and is therefore idempotent — every boot
 * runs it and each entry lands exactly once. Only missing ids are inserted, so
 * a row already in the local database always wins. The corollary is that ids
 * are permanent: changing one after it has merged produces a duplicate rather
 * than an update.
 */
import { query } from './database';
import { insertAttempt } from './repo';
import { BOX_DAYS } from '../store/defaults';
import { addDays } from '../lib/date';
import { PROBLEM_BY_ID } from '../data/problems';
import { OUTCOME_BY_ID } from '../data/mistakes';
import * as github from './github';

const NOTE =
  'Attempts held outside the browser. The app merges any entry whose id it has ' +
  'not seen into its own database on load, and commits this file back when ' +
  'anything changes. Ids must be stable and unique — re-merging the same id is ' +
  'a no-op, and changing an id creates a duplicate attempt.';

/** The blob sha of the file we last read, so a write can detect a conflict. */
let lastSha = null;

/** Rejects anything that would land malformed data in the attempt table. */
function validate(entry) {
  if (!entry || typeof entry !== 'object') return 'not an object';
  if (!entry.id) return 'missing id';
  if (!PROBLEM_BY_ID[entry.problemId]) return `unknown problemId "${entry.problemId}"`;
  if (!OUTCOME_BY_ID[entry.outcome]) return `unknown outcome "${entry.outcome}"`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? '')) return `bad date "${entry.date}"`;
  return null;
}

/**
 * The Leitner box for a merged attempt, matching what logAttempt computes:
 * a clean solve promotes one box, anything else resets to the front.
 */
function nextRevision(entry, prevBox) {
  const box = entry.outcome === 'solved-clean' ? Math.min(prevBox + 1, BOX_DAYS.length - 1) : 0;
  return { box, due: addDays(entry.date, BOX_DAYS[box]) };
}

/** GitHub first when a token is present, then the file shipped with the build. */
async function loadEntries() {
  if (github.isConfigured()) {
    try {
      const remote = await github.fetchLogbook();
      if (remote) {
        lastSha = remote.sha;
        return remote.json?.attempts ?? [];
      }
      // Configured but the file is not on the branch yet — the first push
      // creates it. Fall through to the deployed copy for this boot.
      lastSha = null;
    } catch (err) {
      console.warn('DSA HERO: could not read the logbook from GitHub —', err.message);
    }
  }

  try {
    const res = await fetch(`${import.meta.env.BASE_URL}logbook.json`, { cache: 'no-cache' });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.attempts ?? [];
  } catch {
    // Offline, or never deployed. The app is fully usable without it.
    return [];
  }
}

/**
 * Reads the logbook and inserts what is missing.
 * Returns the number of attempts merged; 0 covers "nothing new" and "no file".
 */
export async function mergeLogbook() {
  const entries = await loadEntries();
  if (entries.length === 0) return 0;

  // Oldest first, so a problem solved twice promotes its box in the right order.
  const ordered = [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const known = new Set(query('SELECT id FROM attempt').map((r) => r.id));
  let merged = 0;

  for (const entry of ordered) {
    if (known.has(entry.id)) continue;

    const problem = validate(entry);
    if (problem) {
      console.warn(`DSA HERO: skipping logbook entry — ${problem}`);
      continue;
    }

    const prevBox = query('SELECT box FROM revision WHERE problem_id = ?', [entry.problemId])[0]
      ?.box;

    insertAttempt(
      {
        id: entry.id,
        problemId: entry.problemId,
        date: entry.date,
        outcome: entry.outcome,
        minutes: Number(entry.minutes) || 0,
        hints: Number(entry.hints) || 0,
        tries: Number(entry.tries) || 1,
        viewedSolution: Boolean(entry.viewedSolution),
        mistakes: entry.mistakes ?? [],
        notes: entry.notes ?? '',
        code: entry.code ?? '',
        language: entry.language ?? 'java',
        mode: entry.mode ?? 'practice',
      },
      nextRevision(entry, prevBox ?? -1)
    );

    known.add(entry.id);
    merged += 1;
  }

  return merged;
}

/** Every attempt in the database, in the logbook's on-disk shape. */
export function buildLogbook() {
  const mistakes = new Map();
  for (const { attempt_id, mistake } of query('SELECT attempt_id, mistake FROM attempt_mistake')) {
    mistakes.set(attempt_id, [...(mistakes.get(attempt_id) ?? []), mistake]);
  }

  const attempts = query('SELECT * FROM attempt ORDER BY attempted_on, created_at, id').map((r) => ({
    id: r.id,
    problemId: r.problem_id,
    date: r.attempted_on,
    outcome: r.outcome,
    minutes: r.minutes,
    hints: r.hints,
    tries: r.tries,
    viewedSolution: Boolean(r.viewed_solution),
    mistakes: mistakes.get(r.id) ?? [],
    notes: r.notes ?? '',
    code: r.code ?? '',
    language: r.language ?? 'java',
    mode: r.mode ?? 'practice',
  }));

  return { version: 1, note: NOTE, attempts };
}

/**
 * Commits the current database to GitHub. No-op without a token.
 *
 * On a sha conflict — the file moved under us, which means another device or a
 * hand edit got there first — it re-reads, merges that state in, and retries
 * once, so the two sides converge instead of one clobbering the other.
 */
export async function pushLogbook(reason = 'Update the logbook') {
  if (!github.isConfigured()) return { pushed: false, reason: 'not configured' };

  const attempt = async () => {
    const json = buildLogbook();
    lastSha = await github.commitLogbook(json, lastSha, `${reason} (${json.attempts.length} attempts)`);
    return { pushed: true, count: json.attempts.length };
  };

  try {
    return await attempt();
  } catch (err) {
    if (!String(err.message).includes('409') && !String(err.message).includes('422')) throw err;
    await mergeLogbook();
    return attempt();
  }
}
