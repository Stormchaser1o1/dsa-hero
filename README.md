# DSA Hero

Daily data-structures-and-algorithms practice, from "I know loops" to FAANG-level
interview ready. Two problems a day on weekdays, four at the weekend, in Java.

Started: **2026-08-07**

## Live dashboard

**https://stormchaser1o1.github.io/dsa-hero/**

A React + Vite app in `web/` that renders today's set, the difficulty split,
pattern mastery, the 14-phase roadmap and the re-solve queue straight from
`web/src/data/progress.js`.

### Updating it

1. Edit `web/src/data/progress.js` (and mirror the change into `PROGRESS.md`).
2. Commit and push to `main` — that's the permanent record.
3. Publish the site:

   ```bash
   cd web
   npm run deploy      # lint → smoke test → build → push to gh-pages
   ```

### Working on the dashboard

```bash
cd web
npm install
npm run dev        # http://localhost:5173/dsa-hero/
npm run smoke      # renders the app in jsdom, fails on any console error
npm run lint
```

## Structure

```
dsa hero/
├── README.md                  <- you are here
├── PROGRESS.md                <- markdown log: phase, solved count, weak patterns
├── notes/                     <- one note per problem: approach, complexity, gotcha
│   └── phase-00-foundations/
├── solutions/                 <- every Java solution, organised by phase
│   └── phase-00-foundations/
└── web/                       <- React dashboard (Vite)
    ├── src/data/progress.js   <- the data the dashboard renders from
    ├── src/data/selectors.js  <- derived counts (solved, difficulty, patterns)
    ├── src/styles/tokens.css  <- design tokens (colour, type, space, motion)
    ├── test/smoke.mjs         <- jsdom render check
    └── scripts/deploy.mjs     <- publishes dist/ to the gh-pages branch
```

## How a session runs

1. **Dashboard** — current phase, solved count, what's due for re-solve.
2. **Pattern lesson** (if the day opens a new phase) — the idea behind the
   pattern before any problem that uses it.
3. **Problem 1** — read it back in your own words, state the brute force, give
   its complexity, then optimise. 25 minutes before any hint; hints come in
   levels, never a full solution.
4. **Problem 2** — same loop.
5. **Debrief** — complexity of what you wrote, the one-line takeaway, and the
   note committed to `notes/`.
6. **Log** — update `PROGRESS.md` + `progress.js`, commit, deploy.

Weekends run four problems, with the last one deliberately above your current level.

## Rules

- Brute force is a real answer. Write it, name its complexity, then beat it.
- No looking at solutions before 25 minutes of honest attempt.
- Every solved problem returns for a cold re-solve on day 1, day 7 and day 30.
- A problem isn't done until you can state its time *and* space complexity.
- If a hint was needed, its pattern goes into **weak patterns**.

## Roadmap

| Phase | Topic | Problems |
|-------|-------|----------|
| 0  | Foundations & Big-O | 6 lessons |
| 1  | Arrays | 10 |
| 2  | Strings | 10 |
| 3  | Two Pointers & Sliding Window | 10 |
| 4  | Binary Search & Sorting | 10 |
| 5  | Hashing & Prefix Sums | 8 |
| 6  | Recursion & Backtracking | 10 |
| 7  | Linked Lists | 10 |
| 8  | Stacks & Queues | 8 |
| 9  | Trees & BST | 12 |
| 10 | Heaps & Greedy | 8 |
| 11 | Graphs | 12 |
| 12 | Dynamic Programming | 14 |
| 13 | Advanced & Mock Interviews | 12 |

**134 problems** — 40 easy, 76 medium, 18 hard.

## Environment

- OS: Windows 11
- JDK: 25.0.3 LTS
- Editor: VS Code
