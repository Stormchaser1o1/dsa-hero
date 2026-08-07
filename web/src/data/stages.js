/**
 * The nine stages of the journey. A stage unlocks when every `requires`
 * condition is met — measured from real performance, never from time spent.
 */
export const STAGES = [
  {
    id: 'beginner',
    name: 'DSA Beginner',
    tagline: 'Getting oriented',
    blurb: 'You know loops. Now learn what a problem is actually asking.',
    requires: { solved: 0, topics: 0, accuracy: 0, medium: 0, hard: 0 },
  },
  {
    id: 'logic-builder',
    name: 'Logic Builder',
    tagline: 'Thinking in steps',
    blurb: 'Translate a plain-English rule into a loop and a condition without freezing.',
    requires: { solved: 8, topics: 1, accuracy: 45, medium: 0, hard: 0 },
  },
  {
    id: 'foundation',
    name: 'DSA Foundation',
    tagline: 'Arrays, strings, hashing',
    blurb: 'The three structures that 60% of interview questions are built on.',
    requires: { solved: 30, topics: 3, accuracy: 50, medium: 2, hard: 0 },
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    tagline: 'Brute force, then better',
    blurb: 'You can always produce a working solution, then improve it on purpose.',
    requires: { solved: 60, topics: 6, accuracy: 55, medium: 12, hard: 0 },
  },
  {
    id: 'pattern-master',
    name: 'Pattern Master',
    tagline: 'Recognition over recall',
    blurb: 'You see two pointers, sliding window or binary search before you write code.',
    requires: { solved: 100, topics: 10, accuracy: 60, medium: 30, hard: 2 },
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    tagline: 'Recursion, trees, heaps',
    blurb: 'Comfortable with structures that call themselves.',
    requires: { solved: 140, topics: 14, accuracy: 63, medium: 55, hard: 6 },
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Graphs and DP',
    blurb: 'The two topics that decide most senior loops.',
    requires: { solved: 180, topics: 18, accuracy: 66, medium: 80, hard: 14 },
  },
  {
    id: 'interview-ready',
    name: 'Interview Ready',
    tagline: 'Solving under pressure',
    blurb: 'Timed, mixed-topic, explained out loud, complexity stated.',
    requires: { solved: 215, topics: 21, accuracy: 70, medium: 100, hard: 22 },
  },
  {
    id: 'faang-ready',
    name: 'FAANG / MAANG Ready',
    tagline: 'The destination',
    blurb: 'Independent solves on hards, clean follow-ups, no hint dependency.',
    requires: { solved: 240, topics: 24, accuracy: 75, medium: 115, hard: 30 },
  },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

export function stageIndexById(id) {
  return Math.max(0, STAGE_IDS.indexOf(id));
}

/** The furthest stage whose requirements are all satisfied. */
export function resolveStage(metrics) {
  let reached = STAGES[0];
  for (const stage of STAGES) {
    const r = stage.requires;
    const ok =
      metrics.solved >= r.solved &&
      metrics.topicsCompleted >= r.topics &&
      metrics.accuracy >= r.accuracy &&
      metrics.medium >= r.medium &&
      metrics.hard >= r.hard;
    if (ok) reached = stage;
    else break;
  }
  return reached;
}

/** Per-requirement completion for the stage after the current one. */
export function nextStageProgress(metrics) {
  const current = resolveStage(metrics);
  const next = STAGES[stageIndexById(current.id) + 1];
  if (!next) return { current, next: null, checks: [], percent: 100 };

  const r = next.requires;
  const checks = [
    { label: 'Problems solved', have: metrics.solved, need: r.solved },
    { label: 'Topics completed', have: metrics.topicsCompleted, need: r.topics },
    { label: 'Accuracy', have: Math.round(metrics.accuracy), need: r.accuracy, unit: '%' },
    { label: 'Medium solved', have: metrics.medium, need: r.medium },
    { label: 'Hard solved', have: metrics.hard, need: r.hard },
  ].filter((c) => c.need > 0);

  const percent = checks.length
    ? (checks.reduce((sum, c) => sum + Math.min(1, c.have / c.need), 0) / checks.length) * 100
    : 100;

  return { current, next, checks, percent };
}

/** Four coarse bands shown on the dashboard journey strip. */
export const JOURNEY_BANDS = [
  { id: 'beginner', name: 'Beginner', sub: 'Basics', stages: ['beginner', 'logic-builder'] },
  { id: 'builder', name: 'Builder', sub: 'DSA Core', stages: ['foundation', 'problem-solver'] },
  {
    id: 'advanced',
    name: 'Advanced',
    sub: 'Advanced DSA',
    stages: ['pattern-master', 'intermediate', 'advanced'],
  },
  {
    id: 'expert',
    name: 'Expert',
    sub: 'FAANG Ready',
    stages: ['interview-ready', 'faang-ready'],
  },
];
