/**
 * Attempts recorded in the repo rather than in the browser.
 *
 * The app's database lives in IndexedDB, so solving a problem at the keyboard
 * and committing the Java file leaves the app knowing nothing about it. This
 * closes that gap in the only direction a static site can: `public/logbook.json`
 * ships with the build, and every boot merges the entries the local database
 * has not seen yet.
 *
 * Merging is keyed on the attempt id and is therefore idempotent — reloading
 * the page a hundred times inserts each entry once. The corollary is that ids
 * are permanent: editing an entry's id after it has been merged produces a
 * duplicate attempt rather than an update.
 *
 * Nothing here deletes or rewrites local rows. An attempt logged by hand in
 * Practice always wins, because the merge only ever inserts missing ids.
 */
import { query } from './database';
import { insertAttempt } from './repo';
import { BOX_DAYS } from '../store/defaults';
import { addDays } from '../lib/date';
import { PROBLEM_BY_ID } from '../data/problems';
import { OUTCOME_BY_ID } from '../data/mistakes';

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
 * The Leitner box for a merged attempt, matching what logAttempt would compute:
 * a clean solve promotes one box, anything else resets to the front.
 */
function nextRevision(entry, prevBox) {
  const box = entry.outcome === 'solved-clean' ? Math.min(prevBox + 1, BOX_DAYS.length - 1) : 0;
  return { box, due: addDays(entry.date, BOX_DAYS[box]) };
}

/**
 * Fetches the logbook and inserts what is missing.
 * Returns the number of attempts merged; 0 covers "nothing new" and "no file".
 */
export async function mergeLogbook() {
  let payload;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}logbook.json`, { cache: 'no-cache' });
    if (!res.ok) return 0;
    payload = await res.json();
  } catch {
    // Offline, or the file was never deployed. The app is fully usable without it.
    return 0;
  }

  const entries = Array.isArray(payload?.attempts) ? payload.attempts : [];
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
    const revision = nextRevision(entry, prevBox ?? -1);

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
      revision
    );

    known.add(entry.id);
    merged += 1;
  }

  return merged;
}
