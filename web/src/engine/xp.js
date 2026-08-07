/** XP per solve, by difficulty. Independent solves are worth more, because
 *  that is the thing the whole system is trying to produce. */
export const XP_FOR = { easy: 10, medium: 25, hard: 50 };

export const RANKS = [
  'DSA Novice',
  'Loop Wrangler',
  'Array Handler',
  'Pattern Seeker',
  'Window Slider',
  'Recursion Adept',
  'Tree Climber',
  'Graph Walker',
  'DP Tactician',
  'Interview Athlete',
  'DSA Hero',
];

/** Level n costs 400 + 100n XP, so early levels come fast and later ones don't. */
export function levelSize(level) {
  return 400 + 100 * level;
}

export function levelFromXp(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= levelSize(level)) {
    remaining -= levelSize(level);
    level++;
  }
  return {
    level,
    into: remaining,
    need: levelSize(level),
    percent: (remaining / levelSize(level)) * 100,
    rank: RANKS[Math.min(level - 1, RANKS.length - 1)],
  };
}
