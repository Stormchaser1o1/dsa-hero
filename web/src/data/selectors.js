import { SOLVABLE } from './phaseIcons';

/** Every problem across every phase, flattened. */
export function allItems(phases) {
  return phases.flatMap((p) => p.problems);
}

/** Concept lessons are tracked but never counted as "problems solved". */
export function solvableItems(phases) {
  return allItems(phases).filter((p) => SOLVABLE.includes(p.difficulty));
}

/** { easy: { done, total }, medium: {...}, hard: {...} } */
export function byDifficulty(phases) {
  const out = Object.fromEntries(SOLVABLE.map((d) => [d, { done: 0, total: 0 }]));
  for (const p of solvableItems(phases)) {
    out[p.difficulty].total++;
    if (p.done) out[p.difficulty].done++;
  }
  return out;
}

export function solvedCount(phases) {
  return solvableItems(phases).filter((p) => p.done).length;
}

export function totalCount(phases) {
  return solvableItems(phases).length;
}

/** Overall completion across problems *and* concept lessons. */
export function overallPercent(phases) {
  const items = allItems(phases);
  if (!items.length) return 0;
  return (items.filter((p) => p.done).length / items.length) * 100;
}

/** How many problems today asks for: 2 on weekdays, 4 at the weekend. */
export function todayTarget(schedule, date = new Date()) {
  const day = date.getDay(); // 0 Sun … 6 Sat
  return day === 0 || day === 6 ? schedule.weekend : schedule.weekday;
}

export function isWeekend(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Pattern → { done, total }, sorted by how much of it is still unsolved. */
export function byPattern(phases) {
  const map = new Map();
  for (const p of solvableItems(phases)) {
    if (!p.pattern) continue;
    const row = map.get(p.pattern) ?? { pattern: p.pattern, done: 0, total: 0 };
    row.total++;
    if (p.done) row.done++;
    map.set(p.pattern, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.pattern.localeCompare(b.pattern));
}

export function daysUntil(iso) {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}
