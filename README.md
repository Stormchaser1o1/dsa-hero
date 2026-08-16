# DSA HERO

A complete personal DSA training system — not a question tracker. It starts from
"I know loops", teaches progressively, adapts difficulty to how you actually
perform, remembers your weaknesses, brings old concepts back, and works toward
FAANG/MAANG interview readiness.

**Two problems a day on weekdays. Four at the weekend. In Java.**

Started: **2026-08-07**

## Live app

**https://stormchaser1o1.github.io/dsa-hero/**

A React + Vite single-page app with twelve sections. Your progress lives in a
real SQLite database running in your browser via WebAssembly (`sql.js`),
persisted to IndexedDB. Settings exports it as a `.sqlite` file you can open in
any SQLite tool.

| Page | What it does |
|------|--------------|
| **Dashboard** | Level, streak, solved counts, difficulty split, practice calendar, today's plan, journey strip |
| **Today's Plan** | The day's mission — 2 problems (4 at weekends), each with role, topic, pattern and reason |
| **Practice** | The solving workspace: timer, 8-step thinking frame, 3-level hint ladder, solution-code field, attempt logger |
| **Problems** | All 246 problems — filter by topic, difficulty, status; search by title or pattern |
| **Progress** | Interview readiness score with its eight weighted factors, activity heatmap, topic mastery, mistake profile, strong/weak topics |
| **Patterns** | 16 core patterns — the recognition cue, the idea, the tell, a Java template, and every problem that uses it |
| **Contests** | Four timed round formats that unlock with volume, plus weekend history |
| **Achievements** | 20 badges and the XP/level curve |
| **Notes** | Every attempt ever logged, editable, searchable |
| **Resources** | Constraint-to-complexity table, Big-O cheat sheet, Java snippets, curated links |
| **Roadmap** | The 9 stages with their unlock requirements, live-checked against your stats |
| **Settings** | Goals, profile, theme, export/import, reset |

## How the system works

### Progression is earned, not scheduled

A topic unlocks at **60%** of the previous topic solved, and counts as complete
at **70%**. A stage unlocks only when *every* requirement is met at once — so
you cannot reach "Interview Ready" by grinding easies.

```
DSA Beginner → Logic Builder → DSA Foundation → Problem Solver → Pattern Master
→ Intermediate → Advanced → Interview Ready → FAANG/MAANG Ready
```

### The daily plan adapts to your form

The planner reads your last 10 attempts and classifies your form:

- **struggling** (< 50% solve rate) → drops hards, adds a reinforcement problem
  targeting your weakest pattern
- **steady** → holds difficulty, works down the current topic in teaching order
- **cruising** (≥ 80% solves, ≤ 30% hint usage) → opens up hard problems

Each slot in the plan has a role: `new`, `retry` (you failed it before),
`revision` (spaced re-solve), `reinforce` (weak pattern), or `stretch`
(weekends only — deliberately above your level).

### Spaced revision

Solved problems return on a Leitner schedule — **1, 3, 7, 16, 30, 60 days**. A
clean re-solve promotes the problem to the next box; a miss resets it to day 1.

### Interview readiness is not "problems solved"

The score is a weighted blend, with a penalty for unaddressed weak topics:

| Factor | Weight |
|--------|--------|
| Topic coverage | 20% |
| Medium volume | 18% |
| Independent solving | 16% |
| Hard volume | 12% |
| Accuracy | 10% |
| Pattern mastery | 10% |
| Consistency | 8% |
| Speed on mediums | 6% |

Bands: Not Ready → Building Foundation → Developing → Interview Capable →
Strong → FAANG/MAANG Ready.

### Mistakes are tracked, not just outcomes

Every attempt logs an outcome (solved clean / solved with hints / solved after
reading / failed) plus optional mistake tags: logic, syntax, complexity, edge
case, pattern recognition, wrong approach, optimization, conceptual gap. These
feed the weak-areas view and the planner.

## The curriculum

**246 problems across 24 topics** — 94 easy, 121 medium, 31 hard.

224 of them link to LeetCode, which is where you run your code and where the
test cases come from. The other **22 are local drills** with no online judge.
For those you write the code and its test harness yourself, in `solutions/`:

| Topic | Local drills |
|-------|--------------|
| 1 · Programming & Logic Building | 7 of 8 — every problem except FizzBuzz, which does link to LeetCode |
| 2 · Time & Space Complexity | all 6 |
| 3 · Arrays | 3 — largest element, second largest, check if sorted |
| 13 · Recursion | 4 — factorial and sum to n, reverse a string recursively, merge sort, quick sort |
| 23 · Mixed Interview Problems | 2 — both mock rounds |

| # | Topic | Problems | # | Topic | Problems |
|---|-------|----------|---|-------|----------|
| 1 | Programming & Logic Building | 8 | 13 | Recursion | 8 |
| 2 | Time & Space Complexity | 6 | 14 | Backtracking | 10 |
| 3 | Arrays | 14 | 15 | Trees | 14 |
| 4 | Strings | 12 | 16 | Binary Search Trees | 8 |
| 5 | Hashing | 10 | 17 | Heaps / Priority Queues | 10 |
| 6 | Two Pointers | 10 | 18 | Greedy Algorithms | 10 |
| 7 | Sliding Window | 10 | 19 | Graphs | 14 |
| 8 | Prefix Sum | 8 | 20 | Dynamic Programming | 18 |
| 9 | Binary Search | 12 | 21 | Advanced Data Structures | 8 |
| 10 | Linked Lists | 12 | 22 | Advanced Algorithms | 8 |
| 11 | Stacks | 10 | 23 | Mixed Interview Problems | 10 |
| 12 | Queues | 6 | 24 | FAANG / MAANG Prep | 10 |

## Learning philosophy

Every problem runs through the same frame:

**Problem → Thought Process → Brute Force → Optimization → Pattern → Optimal
Solution → Complexity → Lessons Learned**

Rules:

- Brute force is a real answer. Write it, name its complexity, then beat it.
- 25 minutes of honest thinking before hint 1. Hints come one level at a time —
  cue, then idea, then code skeleton. Never a full solution.
- A problem is not done until you can state time *and* space complexity.
- Solving with help is logged differently from solving alone. Only independent
  solves earn the 1.5× XP and count toward the independence factor.

## Structure

```
dsa hero/
├── README.md                    <- you are here
├── PROGRESS.md                  <- human-readable log
├── notes/                       <- per-problem notes, one folder per topic
├── solutions/                   <- Java solutions, one folder per topic
└── web/
    ├── src/data/                <- curriculum: problems, topics, patterns,
    │                               stages, achievements, mistakes, resources
    ├── src/engine/              <- stats, planner, readiness, xp
    ├── src/store/               <- localStorage state + actions
    ├── src/pages/               <- the twelve pages
    ├── src/components/          <- layout + UI primitives
    ├── test/engine.mjs          <- 44 logic assertions
    └── test/smoke.mjs           <- renders all 13 routes in jsdom
```

## Development

```bash
cd web
npm install
npm run dev          # http://localhost:5173/dsa-hero/
npm run test         # engine assertions + jsdom route render
npm run lint
npm run deploy       # lint → test → build → push to gh-pages
```

## Environment

- OS: Windows 11 · JDK 25.0.3 LTS · VS Code
