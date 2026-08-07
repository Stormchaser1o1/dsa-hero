/** The mistake taxonomy. Logged per attempt, aggregated into weak areas. */
export const MISTAKE_TYPES = [
  { id: 'logic', label: 'Logic mistake', hint: 'The approach was right but the steps were wrong.', hue: 'var(--hue-1)' },
  { id: 'syntax', label: 'Syntax / API', hint: 'Java or library detail, not the algorithm.', hue: 'var(--hue-2)' },
  { id: 'complexity', label: 'Complexity', hint: 'Solution worked but was too slow, or you misjudged the Big-O.', hue: 'var(--hue-5)' },
  { id: 'edge-case', label: 'Edge case', hint: 'Empty input, single element, duplicates, overflow.', hue: 'var(--hue-6)' },
  { id: 'pattern', label: 'Pattern recognition', hint: 'Did not spot which pattern the problem wanted.', hue: 'var(--hue-7)' },
  { id: 'approach', label: 'Wrong approach', hint: 'Committed to a direction that could not work.', hue: 'var(--hue-8)' },
  { id: 'optimization', label: 'Optimization', hint: 'Got a brute force but could not improve it.', hue: 'var(--hue-3)' },
  { id: 'concept', label: 'Conceptual gap', hint: 'Did not understand the underlying data structure.', hue: 'var(--hue-4)' },
];

export const MISTAKE_BY_ID = Object.fromEntries(MISTAKE_TYPES.map((m) => [m.id, m]));

/** Outcomes recorded when you close out a problem. */
export const OUTCOMES = [
  { id: 'solved-clean', label: 'Solved, no help', desc: 'Independent solve. This is the one that counts.', solved: true, independent: true },
  { id: 'solved-hints', label: 'Solved with hints', desc: 'Got there, but needed a nudge.', solved: true, independent: false },
  { id: 'solved-after-solution', label: 'Solved after reading', desc: 'Read the approach, then implemented it.', solved: true, independent: false },
  { id: 'failed', label: 'Could not solve', desc: 'Log it honestly — this drives your practice queue.', solved: false, independent: false },
];

export const OUTCOME_BY_ID = Object.fromEntries(OUTCOMES.map((o) => [o.id, o]));
