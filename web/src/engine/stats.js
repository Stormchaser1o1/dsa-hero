import { DIFFICULTIES, PROBLEMS, PROBLEM_BY_ID } from '../data/problems';
import { MASTERY_THRESHOLD, TOPICS, UNLOCK_THRESHOLD } from '../data/topics';
import { PATTERNS, corePatternFor } from '../data/patterns';
import { evaluateAchievements } from '../data/achievements';
import { OUTCOME_BY_ID } from '../data/mistakes';
import { resolveStage } from '../data/stages';
import { computeReadiness } from './readiness';
import { XP_FOR, levelFromXp } from './xp';
import { currentWeekKeys, diffDays, isWeekendKey, todayKey } from '../lib/date';

const emptyCount = () => ({ solved: 0, attempted: 0, total: 0 });

/**
 * One pass over the attempt log produces every number the UI needs.
 * Pure — same state in, same stats out.
 */
export function computeStats(state) {
  const today = todayKey();
  const attempts = state.attempts;

  // ---- per-problem roll-up -------------------------------------------
  /** problemId → { solved, independent, tries, hints, minutes, last, history } */
  const perProblem = new Map();
  for (const a of attempts) {
    const meta = OUTCOME_BY_ID[a.outcome];
    if (!meta) continue;
    const cur = perProblem.get(a.problemId) ?? {
      solved: false,
      independent: false,
      tries: 0,
      hints: 0,
      minutes: 0,
      history: [],
      last: null,
    };
    cur.tries += a.tries;
    cur.hints += a.hints;
    cur.minutes += a.minutes;
    cur.solved = cur.solved || meta.solved;
    cur.independent = cur.independent || meta.independent;
    cur.history.push(a);
    cur.last = a;
    perProblem.set(a.problemId, cur);
  }

  const solvedIds = new Set([...perProblem].filter(([, v]) => v.solved).map(([k]) => k));
  const attemptedIds = new Set(perProblem.keys());

  // ---- difficulty ------------------------------------------------------
  const byDifficulty = Object.fromEntries(DIFFICULTIES.map((d) => [d, emptyCount()]));
  for (const p of PROBLEMS) {
    const row = byDifficulty[p.difficulty];
    row.total++;
    if (solvedIds.has(p.id)) row.solved++;
    if (attemptedIds.has(p.id)) row.attempted++;
  }

  // ---- topics ----------------------------------------------------------
  const byTopic = TOPICS.map((t) => {
    const problems = PROBLEMS.filter((p) => p.topic === t.id);
    const solved = problems.filter((p) => solvedIds.has(p.id)).length;
    const attempted = problems.filter((p) => attemptedIds.has(p.id)).length;
    const topicAttempts = attempts.filter((a) => PROBLEM_BY_ID[a.problemId]?.topic === t.id);
    const wins = topicAttempts.filter((a) => OUTCOME_BY_ID[a.outcome]?.solved).length;
    const hintedSolves = problems.filter(
      (p) => perProblem.get(p.id)?.solved && !perProblem.get(p.id)?.independent
    ).length;

    return {
      ...t,
      total: problems.length,
      solved,
      attempted,
      hintedSolves,
      ratio: problems.length ? solved / problems.length : 0,
      accuracy: topicAttempts.length ? (wins / topicAttempts.length) * 100 : null,
      attemptCount: topicAttempts.length,
    };
  });

  // Sequential unlocking — the previous topic must clear the threshold.
  let unlockedSoFar = true;
  for (const t of byTopic) {
    t.unlocked = unlockedSoFar;
    t.completed = t.ratio >= MASTERY_THRESHOLD;
    unlockedSoFar = unlockedSoFar && t.ratio >= UNLOCK_THRESHOLD;
  }
  const topicsCompleted = byTopic.filter((t) => t.completed).length;
  const currentTopic = byTopic.find((t) => t.unlocked && !t.completed) ?? byTopic[byTopic.length - 1];

  // ---- patterns --------------------------------------------------------
  const patternAgg = new Map(PATTERNS.map((p) => [p.id, { ...p, solved: 0, total: 0, misses: 0 }]));
  for (const p of PROBLEMS) {
    const core = corePatternFor(p.pattern);
    if (!core) continue;
    const row = patternAgg.get(core);
    row.total++;
    if (solvedIds.has(p.id)) row.solved++;
  }
  for (const a of attempts) {
    const p = PROBLEM_BY_ID[a.problemId];
    const core = p && corePatternFor(p.pattern);
    if (!core) continue;
    if (!OUTCOME_BY_ID[a.outcome]?.solved || a.hints > 0) patternAgg.get(core).misses++;
  }
  const byPattern = [...patternAgg.values()].map((r) => ({
    ...r,
    mastery: r.total ? (r.solved / r.total) * 100 : 0,
  }));
  const masteredPatterns = byPattern.filter((p) => p.mastery >= 60).length;

  // ---- accuracy, independence, timing ----------------------------------
  const totalAttempts = attempts.length;
  const winningAttempts = attempts.filter((a) => OUTCOME_BY_ID[a.outcome]?.solved).length;
  const accuracy = totalAttempts ? (winningAttempts / totalAttempts) * 100 : 0;

  const independentSolves = [...perProblem.values()].filter((v) => v.independent).length;
  const independentRate = solvedIds.size ? independentSolves / solvedIds.size : 0;

  const timed = attempts.filter((a) => a.minutes > 0);
  const avgMinutes = timed.length
    ? timed.reduce((s, a) => s + a.minutes, 0) / timed.length
    : 0;

  const mediumTimed = timed.filter((a) => PROBLEM_BY_ID[a.problemId]?.difficulty === 'medium');
  const avgMediumMinutes = mediumTimed.length
    ? mediumTimed.reduce((s, a) => s + a.minutes, 0) / mediumTimed.length
    : 0;

  const easySolveTimes = attempts
    .filter(
      (a) =>
        PROBLEM_BY_ID[a.problemId]?.difficulty === 'easy' &&
        OUTCOME_BY_ID[a.outcome]?.solved &&
        a.minutes > 0
    )
    .map((a) => a.minutes);
  const fastestEasy = easySolveTimes.length ? Math.min(...easySolveTimes) : null;

  // ---- activity, streaks -----------------------------------------------
  const activity = new Map();
  for (const a of attempts) activity.set(a.date, (activity.get(a.date) ?? 0) + 1);
  const activeDays = [...activity.keys()].sort();

  let currentStreak = 0;
  if (activity.has(today) || activity.has(shift(today, -1))) {
    let cursor = activity.has(today) ? today : shift(today, -1);
    while (activity.has(cursor)) {
      currentStreak++;
      cursor = shift(cursor, -1);
    }
  }

  let bestStreak = 0;
  let run = 0;
  for (let i = 0; i < activeDays.length; i++) {
    run = i > 0 && diffDays(activeDays[i], activeDays[i - 1]) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
  }

  const activeDaysLast30 = activeDays.filter((d) => diffDays(today, d) <= 30).length;

  // ---- goals -----------------------------------------------------------
  const goalToday = isWeekendKey(today) ? state.goals.weekend : state.goals.weekday;
  const solvedToday = new Set(
    attempts.filter((a) => a.date === today && OUTCOME_BY_ID[a.outcome]?.solved).map((a) => a.problemId)
  ).size;

  const weekKeys = currentWeekKeys();
  const weeklyTarget = weekKeys.reduce(
    (sum, k) => sum + (isWeekendKey(k) ? state.goals.weekend : state.goals.weekday),
    0
  );
  const solvedThisWeek = new Set(
    attempts
      .filter((a) => weekKeys.includes(a.date) && OUTCOME_BY_ID[a.outcome]?.solved)
      .map((a) => a.problemId)
  ).size;

  const weekendsCleared = countWeekendsCleared(attempts, state.goals.weekend);

  // ---- mistakes and weak areas ------------------------------------------
  const mistakeCounts = new Map();
  for (const a of attempts)
    for (const m of a.mistakes ?? []) mistakeCounts.set(m, (mistakeCounts.get(m) ?? 0) + 1);

  const weakTopics = byTopic
    .filter((t) => t.attemptCount >= 3 && t.accuracy != null && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);
  const strongTopics = byTopic
    .filter((t) => t.attemptCount >= 3 && t.accuracy != null && t.accuracy >= 75)
    .sort((a, b) => b.accuracy - a.accuracy);
  const weakPatterns = byPattern
    .filter((p) => p.misses >= 2)
    .sort((a, b) => b.misses - a.misses)
    .slice(0, 6);

  // ---- readiness --------------------------------------------------------
  const readiness = computeReadiness({
    topicsCompleted,
    totalTopics: TOPICS.length,
    mediumSolved: byDifficulty.medium.solved,
    hardSolved: byDifficulty.hard.solved,
    accuracy,
    independentRate,
    currentStreak,
    activeDaysLast30,
    avgMediumMinutes,
    masteredPatterns,
    totalPatterns: PATTERNS.length,
    weakTopicCount: weakTopics.length,
  });

  // ---- stage ------------------------------------------------------------
  const metrics = {
    solved: solvedIds.size,
    topicsCompleted,
    accuracy,
    medium: byDifficulty.medium.solved,
    hard: byDifficulty.hard.solved,
  };
  const stage = resolveStage(metrics);

  // ---- XP and level (problems + achievement bonuses) --------------------
  let problemXp = 0;
  for (const id of solvedIds) {
    const p = PROBLEM_BY_ID[id];
    if (!p) continue;
    const base = XP_FOR[p.difficulty] ?? 10;
    problemXp += perProblem.get(id)?.independent ? Math.round(base * 1.5) : base;
  }

  const base = {
    solved: solvedIds.size,
    attempted: attemptedIds.size,
    totalProblems: PROBLEMS.length,
    byDifficulty,
    accuracy,
    bestStreak,
    currentStreak,
    topicsCompleted,
    masteredPatterns,
    independentSolves,
    fastestEasy,
    weekendsCleared,
    readiness,
  };
  const achievements = evaluateAchievements(base);
  const achievementXp = achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0);
  const totalXp = problemXp + achievementXp;
  const level = levelFromXp(totalXp);

  // ---- recent -----------------------------------------------------------
  const recent = [...attempts]
    .reverse()
    .slice(0, 12)
    .map((a) => ({ ...a, problem: PROBLEM_BY_ID[a.problemId] }))
    .filter((a) => a.problem);

  return {
    ...base,
    perProblem,
    solvedIds,
    attemptedIds,
    byTopic,
    currentTopic,
    byPattern,
    weakPatterns,
    weakTopics,
    strongTopics,
    mistakeCounts,
    totalAttempts,
    winningAttempts,
    independentRate,
    avgMinutes,
    avgMediumMinutes,
    activity,
    activeDays,
    activeDaysLast30,
    goalToday,
    solvedToday,
    weeklyTarget,
    solvedThisWeek,
    weekKeys,
    stage,
    metrics,
    achievements,
    totalXp,
    problemXp,
    achievementXp,
    level,
    recent,
    overallPercent: (solvedIds.size / PROBLEMS.length) * 100,
  };
}

function shift(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function countWeekendsCleared(attempts, weekendGoal) {
  const perDay = new Map();
  for (const a of attempts) {
    if (!OUTCOME_BY_ID[a.outcome]?.solved) continue;
    if (!isWeekendKey(a.date)) continue;
    const set = perDay.get(a.date) ?? new Set();
    set.add(a.problemId);
    perDay.set(a.date, set);
  }
  return [...perDay.values()].filter((s) => s.size >= weekendGoal).length;
}
