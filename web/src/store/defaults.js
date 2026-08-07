import { todayKey } from '../lib/date';

/** The empty journey. Kept in its own module so pure-logic tests can import
 *  it without pulling in the SQLite/WASM layer. */
export const DEFAULT_STATE = {
  version: 1,
  startedOn: todayKey(),
  /** One row per logged attempt. Append-only — the history is the point. */
  attempts: [],
  /** dateKey → { problemIds, roles, reasons, generatedAt, kind } */
  plans: {},
  /** problemId → { due, box } — Leitner-style spaced re-solves. */
  revisions: {},
  goals: { weekday: 2, weekend: 4 },
  seenAchievements: [],
  profile: { name: 'DSA Hero' },
};

/** Leitner boxes, in days. A clean solve promotes; a miss resets to box 0. */
export const BOX_DAYS = [1, 3, 7, 16, 30, 60];
