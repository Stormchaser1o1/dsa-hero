/**
 * Engine test — simulates a journey through the attempt log and asserts the
 * derived stats, planner and progression behave. Pure logic, no DOM.
 *
 * Run with: npm run test:engine
 */
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });

const { computeStats } = await vite.ssrLoadModule('/src/engine/stats.js');
const { buildPlan, readForm } = await vite.ssrLoadModule('/src/engine/planner.js');
const { DEFAULT_STATE } = await vite.ssrLoadModule('/src/store/defaults.js');
const { PROBLEMS } = await vite.ssrLoadModule('/src/data/problems.js');
const { levelFromXp } = await vite.ssrLoadModule('/src/engine/xp.js');

const checks = [];
const check = (name, ok) => checks.push([name, Boolean(ok)]);

const dayKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function stateWith(attempts, extra = {}) {
  return { ...DEFAULT_STATE, attempts, revisions: {}, plans: {}, ...extra };
}

function attempt(problemId, outcome, date, over = {}) {
  return {
    id: `${date}-${problemId}`,
    date,
    problemId,
    outcome,
    minutes: 12,
    hints: 0,
    tries: 1,
    viewedSolution: false,
    mistakes: [],
    notes: '',
    ...over,
  };
}

// ---- 1. Empty state is sane, not NaN ---------------------------------
const empty = computeStats(stateWith([]));
check('empty: 0 solved', empty.solved === 0);
check('empty: accuracy is 0 not NaN', empty.accuracy === 0 && !Number.isNaN(empty.accuracy));
check('empty: overall percent is 0', empty.overallPercent === 0);
check('empty: readiness is 0', empty.readiness.score === 0);
check('empty: stage is the first one', empty.stage.id === 'beginner');
check('empty: level 1', empty.level.level === 1);
check('empty: current topic is the first', empty.currentTopic.id === 'logic');
check('empty: no topic is completed', empty.topicsCompleted === 0);
check('empty: only first topic unlocked', empty.byTopic.filter((t) => t.unlocked).length === 1);

// ---- 2. A first plan exists and respects the weekday/weekend target ----
const planWeekday = buildPlan(stateWith([], { goals: { weekday: 2, weekend: 4 } }), empty, '2026-08-05');
const planWeekend = buildPlan(stateWith([], { goals: { weekday: 2, weekend: 4 } }), empty, '2026-08-08');
check('weekday plan has 2 problems', planWeekday.length === 2);
check('weekend plan has 4 problems', planWeekend.length === 4);
check('plan starts in the first topic', planWeekday.every((p) => p.problemId.startsWith('logic-')));
check('plan has no duplicates', new Set(planWeekday.map((p) => p.problemId)).size === planWeekday.length);

// ---- 3. Solving raises solved, XP, accuracy ---------------------------
const logicIds = PROBLEMS.filter((p) => p.topic === 'logic').map((p) => p.id);
const solvedLogic = logicIds.map((id, i) => attempt(id, 'solved-clean', dayKey(-logicIds.length + i)));
const afterLogic = computeStats(stateWith(solvedLogic));
check('solving 8 logic problems registers', afterLogic.solved === 8);
check('accuracy is 100 after clean solves', Math.round(afterLogic.accuracy) === 100);
check('logic topic completed', afterLogic.byTopic[0].completed);
check('second topic unlocked', afterLogic.byTopic[1].unlocked);
check('current topic advanced', afterLogic.currentTopic.id === 'complexity');
check('XP accrued', afterLogic.totalXp > 0);
check('independent solves counted', afterLogic.independentSolves === 8);
check('First Blood unlocked', afterLogic.achievements.find((a) => a.id === 'first-blood')?.unlocked);
check('Century still locked', !afterLogic.achievements.find((a) => a.id === 'century')?.unlocked);

// ---- 4. Streaks -------------------------------------------------------
const streakAttempts = [0, -1, -2, -3].map((d) => attempt(logicIds[0], 'solved-clean', dayKey(d)));
const streaked = computeStats(stateWith(streakAttempts));
check('current streak counts consecutive days', streaked.currentStreak === 4);
check('best streak matches', streaked.bestStreak === 4);
const broken = computeStats(stateWith([attempt(logicIds[0], 'solved-clean', dayKey(-9))]));
check('streak resets after a gap', broken.currentStreak === 0);

// ---- 5. Failing lowers form and biases the plan easier ----------------
const failing = stateWith(
  PROBLEMS.slice(0, 8).map((p, i) => attempt(p.id, 'failed', dayKey(-8 + i), { hints: 3 }))
);
check('form reads as struggling', readForm(failing).label === 'struggling');
const strugglePlan = buildPlan(failing, computeStats(failing), dayKey(0));
check('struggling plan avoids hards', strugglePlan.every((c) => {
  const p = PROBLEMS.find((x) => x.id === c.problemId);
  return p.difficulty !== 'hard';
}));
check('failed problems come back as retries', strugglePlan.some((c) => c.role === 'retry'));

const cruising = stateWith(PROBLEMS.slice(0, 10).map((p, i) => attempt(p.id, 'solved-clean', dayKey(-10 + i))));
check('form reads as cruising', readForm(cruising).label === 'cruising');

// ---- 6. Hinted solves are worth less than independent ones -------------
const cleanOne = computeStats(stateWith([attempt('arrays-11', 'solved-clean', dayKey(0))]));
const hintedOne = computeStats(stateWith([attempt('arrays-11', 'solved-hints', dayKey(0))]));
check('hinted solve still counts as solved', hintedOne.solved === 1);
check('hinted solve earns less XP', hintedOne.totalXp < cleanOne.totalXp);
check('hinted solve is not independent', hintedOne.independentSolves === 0);

// ---- 7. Readiness responds to the right things -------------------------
check('readiness rises with real progress', afterLogic.readiness.score >= empty.readiness.score);
check('readiness factors sum to 100 weight',
  afterLogic.readiness.factors.reduce((s, f) => s + f.weight, 0) === 100);
check('readiness never exceeds 100', afterLogic.readiness.score <= 100);
check('readiness band resolves', typeof afterLogic.readiness.band.label === 'string');

// ---- 8. Weak areas surface from real misses ----------------------------
const weakState = stateWith([
  attempt('arrays-1', 'failed', dayKey(-3), { mistakes: ['edge-case'] }),
  attempt('arrays-2', 'failed', dayKey(-2), { mistakes: ['edge-case', 'logic'] }),
  attempt('arrays-3', 'failed', dayKey(-1), { mistakes: ['edge-case'] }),
]);
const weak = computeStats(weakState);
check('weak topic detected', weak.weakTopics.some((t) => t.id === 'arrays'));
check('mistake counts aggregate', weak.mistakeCounts.get('edge-case') === 3);
check('readiness penalised for weak topics', weak.readiness.penalty > 0);

// ---- 9. Level curve ----------------------------------------------------
check('level 1 at 0 XP', levelFromXp(0).level === 1);
check('level 2 at 500 XP', levelFromXp(500).level === 2);
check('level rises monotonically', levelFromXp(5000).level > levelFromXp(1000).level);
check('level percent stays in range', [0, 137, 900, 5000].every((x) => {
  const l = levelFromXp(x);
  return l.percent >= 0 && l.percent <= 100;
}));

// ---- 10. Plan never returns already-solved new work --------------------
const midway = computeStats(stateWith(solvedLogic));
const midPlan = buildPlan(stateWith(solvedLogic), midway, dayKey(0));
check('plan does not re-serve solved problems as new',
  midPlan.filter((c) => c.role === 'new').every((c) => !midway.solvedIds.has(c.problemId)));

await vite.close();

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
console.log(failed ? `\n${failed} of ${checks.length} check(s) failed.` : `\nAll ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
