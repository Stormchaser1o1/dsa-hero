/** Local-date helpers. Everything is stored as a `YYYY-MM-DD` string in
 *  local time so a late-night session still counts as that day. */

export function toKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(a, b) {
  return Math.round((fromKey(a) - fromKey(b)) / 86_400_000);
}

export function isWeekendKey(key) {
  const day = fromKey(key).getDay();
  return day === 0 || day === 6;
}

export function todayKey() {
  return toKey();
}

export function formatShort(key) {
  return fromKey(key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatLong(key) {
  return fromKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

/** Monday-first weekday index (0 = Mon … 6 = Sun). */
export function mondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

/** Every date key in a month, padded to whole Monday-start weeks. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - mondayIndex(first));

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ key: toKey(d), inMonth: d.getMonth() === month, date: d });
    if (i >= 34 && d.getMonth() !== month && mondayIndex(d) === 6) break;
  }
  return cells;
}

/** The date keys of the current Monday–Sunday week. */
export function currentWeekKeys(today = new Date()) {
  const start = new Date(today);
  start.setDate(today.getDate() - mondayIndex(today));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toKey(d);
  });
}
