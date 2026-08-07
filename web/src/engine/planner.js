import { PROBLEMS, PROBLEM_BY_ID } from '../data/problems';
import { OUTCOME_BY_ID } from '../data/mistakes';
import { corePatternFor } from '../data/patterns';
import { isWeekendKey } from '../lib/date';

const RANK = { easy: 0, medium: 1, hard: 2 };

export const ROLE_META = {
  new: { label: 'New', hint: 'Next problem in your current topic', hue: 'var(--accent)' },
  reinforce: { label: 'Reinforce', hint: 'Targets a pattern you have been losing', hue: 'var(--warn)' },
  retry: { label: 'Retry', hint: "You couldn't finish this one — go again", hue: 'var(--danger)' },
  revision: { label: 'Revision', hint: 'Spaced re-solve, from memory', hue: 'var(--hue-2)' },
  stretch: { label: 'Stretch', hint: 'Deliberately above your current level', hue: 'var(--hue-8)' },
};

/** Recent form drives difficulty, not the calendar. */
export function readForm(state) {
  const recent = state.attempts.slice(-10);
  if (recent.length < 3) return { label: 'calibrating', solveRate: null, hintRate: null };

  const solves = recent.filter((a) => OUTCOME_BY_ID[a.outcome]?.solved).length;
  const solveRate = solves / recent.length;
  const hintRate = recent.filter((a) => a.hints > 0 || a.viewedSolution).length / recent.length;

  if (solveRate < 0.5) return { label: 'struggling', solveRate, hintRate };
  if (solveRate >= 0.8 && hintRate <= 0.3) return { label: 'cruising', solveRate, hintRate };
  return { label: 'steady', solveRate, hintRate };
}

/** Which difficulties today's new problems may come from. */
function allowedDifficulties(form, stats) {
  const hasMediums = stats.byDifficulty.medium.solved >= 5;
  if (form.label === 'struggling') return ['easy', 'medium'].slice(0, hasMediums ? 2 : 1);
  if (form.label === 'cruising') return ['easy', 'medium', 'hard'];
  return ['easy', 'medium'];
}

function seeded(dateKey) {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return Math.abs(h) / 2 ** 31;
  };
}

/**
 * Builds today's mission.
 * @returns {Array<{problemId:string, role:string, reason:string}>}
 */
export function buildPlan(state, stats, dateKey) {
  const weekend = isWeekendKey(dateKey);
  const target = weekend ? state.goals.weekend : state.goals.weekday;
  const form = readForm(state);
  const allowed = allowedDifficulties(form, stats);
  const rand = seeded(dateKey);

  const chosen = [];
  const used = new Set();

  const take = (problemId, role, reason) => {
    if (!problemId || used.has(problemId) || chosen.length >= target) return false;
    used.add(problemId);
    chosen.push({ problemId, role, reason });
    return true;
  };

  // --- 1. Retries: problems whose last attempt failed -------------------
  const lastByProblem = new Map();
  for (const a of state.attempts) lastByProblem.set(a.problemId, a);
  const retries = [...lastByProblem.values()]
    .filter((a) => !OUTCOME_BY_ID[a.outcome]?.solved)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((a) => a.problemId);

  for (const id of retries.slice(0, weekend ? 2 : 1)) {
    take(id, 'retry', 'Last attempt did not land — this is the re-run.');
  }

  // --- 2. Spaced revisions that are due ---------------------------------
  const due = Object.entries(state.revisions)
    .filter(([id, r]) => r.due <= dateKey && stats.solvedIds.has(id))
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);

  for (const id of due.slice(0, weekend ? 2 : 1)) {
    take(id, 'revision', 'Due for a cold re-solve — no notes, no hints.');
  }

  // --- 3. Reinforcement when a pattern keeps costing hints --------------
  if (form.label === 'struggling' && stats.weakPatterns.length) {
    const weak = stats.weakPatterns[0];
    const candidate = PROBLEMS.find(
      (p) =>
        corePatternFor(p.pattern) === weak.id &&
        !stats.solvedIds.has(p.id) &&
        p.difficulty === 'easy'
    );
    take(candidate?.id, 'reinforce', `${weak.name} has been costing you hints — back to basics.`);
  }

  // --- 4. New problems from the current topic, in teaching order --------
  const topicQueue = PROBLEMS.filter(
    (p) => p.topic === stats.currentTopic.id && !stats.solvedIds.has(p.id)
  ).sort((a, b) => a.order - b.order);

  for (const p of topicQueue) {
    if (chosen.length >= target - (weekend ? 1 : 0)) break;
    if (!allowed.includes(p.difficulty)) continue;
    take(p.id, 'new', `Next up in ${stats.currentTopic.name}.`);
  }

  // --- 5. Weekend stretch: one problem deliberately above level ---------
  if (weekend && chosen.length < target) {
    const ceiling = allowed[allowed.length - 1];
    const stretchPool = PROBLEMS.filter(
      (p) =>
        !stats.solvedIds.has(p.id) &&
        RANK[p.difficulty] >= RANK[ceiling] &&
        (stats.byTopic.find((t) => t.id === p.topic)?.unlocked ?? false)
    );
    const pick = stretchPool[Math.floor(rand() * stretchPool.length)] ?? stretchPool[0];
    take(pick?.id, 'stretch', 'Weekend stretch — above your comfort zone on purpose.');
  }

  // --- 6. Backfill from anything unlocked and unsolved -------------------
  if (chosen.length < target) {
    const pool = PROBLEMS.filter(
      (p) =>
        !stats.solvedIds.has(p.id) &&
        !used.has(p.id) &&
        allowed.includes(p.difficulty) &&
        (stats.byTopic.find((t) => t.id === p.topic)?.unlocked ?? false)
    ).sort((a, b) => a.order - b.order);
    for (const p of pool) {
      if (chosen.length >= target) break;
      take(p.id, 'new', 'Keeping the set full.');
    }
  }

  return chosen.filter((c) => PROBLEM_BY_ID[c.problemId]);
}

/** Reads a stored plan, or generates one for the date. */
export function planFor(state, stats, dateKey) {
  const stored = state.plans[dateKey];
  if (stored?.problemIds?.length) {
    return stored.problemIds
      .map((id, i) => ({
        problemId: id,
        role: stored.roles?.[i] ?? 'new',
        reason: stored.reasons?.[i] ?? '',
      }))
      .filter((c) => PROBLEM_BY_ID[c.problemId]);
  }
  return buildPlan(state, stats, dateKey);
}
