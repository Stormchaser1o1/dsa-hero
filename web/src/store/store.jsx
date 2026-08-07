import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { todayKey } from '../lib/date';

const KEY = 'dsa-hero-state-v1';

export const DEFAULT_STATE = {
  version: 1,
  startedOn: todayKey(),
  /** One row per logged attempt. Append-only — the history is the point. */
  attempts: [],
  /** dateKey → { problemIds, generatedAt, kind } */
  plans: {},
  /** problemId → { due, box } — Leitner-style spaced re-solves. */
  revisions: {},
  goals: { weekday: 2, weekend: 4 },
  /** Achievement ids the user has already been shown, so new ones can pop. */
  seenAchievements: [],
  profile: { name: 'DSA Hero' },
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return DEFAULT_STATE;
    // Merge so a state written by an older build still gets new fields.
    return {
      ...DEFAULT_STATE,
      ...parsed,
      goals: { ...DEFAULT_STATE.goals, ...(parsed.goals ?? {}) },
      profile: { ...DEFAULT_STATE.profile, ...(parsed.profile ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode — the app still works for this session */
  }
}

const StoreContext = createContext(null);

/** Leitner boxes, in days. A clean solve promotes; a miss resets to box 0. */
const BOX_DAYS = [1, 3, 7, 16, 30, 60];

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [state]);

  const update = useCallback((fn) => setState((prev) => fn(prev)), []);

  const logAttempt = useCallback(
    (entry) => {
      const stamp = entry.date ?? todayKey();
      update((prev) => {
        const attempt = {
          id: `${stamp}-${entry.problemId}-${prev.attempts.length + 1}`,
          date: stamp,
          problemId: entry.problemId,
          outcome: entry.outcome,
          minutes: Number(entry.minutes) || 0,
          hints: Number(entry.hints) || 0,
          tries: Number(entry.tries) || 1,
          viewedSolution: Boolean(entry.viewedSolution),
          mistakes: entry.mistakes ?? [],
          notes: entry.notes ?? '',
          mode: entry.mode ?? 'practice',
        };

        // Spaced re-solve scheduling.
        const solvedClean = entry.outcome === 'solved-clean';
        const solved = solvedClean || entry.outcome.startsWith('solved');
        const prevBox = prev.revisions[entry.problemId]?.box ?? -1;
        const box = solvedClean ? Math.min(prevBox + 1, BOX_DAYS.length - 1) : 0;
        const revisions = solved
          ? {
              ...prev.revisions,
              [entry.problemId]: { box, due: addDaysKey(stamp, BOX_DAYS[box]) },
            }
          : { ...prev.revisions, [entry.problemId]: { box: 0, due: addDaysKey(stamp, 1) } };

        return { ...prev, attempts: [...prev.attempts, attempt], revisions };
      });
    },
    [update]
  );

  const setPlan = useCallback(
    (dateKey, problemIds, kind) =>
      update((prev) => ({
        ...prev,
        plans: {
          ...prev.plans,
          [dateKey]: { problemIds, kind, generatedAt: new Date().toISOString() },
        },
      })),
    [update]
  );

  const setGoals = useCallback(
    (goals) => update((prev) => ({ ...prev, goals: { ...prev.goals, ...goals } })),
    [update]
  );

  const setProfile = useCallback(
    (profile) => update((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } })),
    [update]
  );

  const markAchievementsSeen = useCallback(
    (ids) =>
      update((prev) => ({
        ...prev,
        seenAchievements: [...new Set([...prev.seenAchievements, ...ids])],
      })),
    [update]
  );

  const updateNote = useCallback(
    (attemptId, notes) =>
      update((prev) => ({
        ...prev,
        attempts: prev.attempts.map((a) => (a.id === attemptId ? { ...a, notes } : a)),
      })),
    [update]
  );

  const deleteAttempt = useCallback(
    (attemptId) =>
      update((prev) => ({ ...prev, attempts: prev.attempts.filter((a) => a.id !== attemptId) })),
    [update]
  );

  const resetAll = useCallback(() => setState({ ...DEFAULT_STATE, startedOn: todayKey() }), []);

  const importState = useCallback((json) => {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (!parsed || !Array.isArray(parsed.attempts)) throw new Error('Not a DSA Hero backup file.');
    setState({ ...DEFAULT_STATE, ...parsed, version: 1 });
  }, []);

  const value = useMemo(
    () => ({
      state,
      logAttempt,
      setPlan,
      setGoals,
      setProfile,
      updateNote,
      deleteAttempt,
      markAchievementsSeen,
      resetAll,
      importState,
    }),
    [
      state,
      logAttempt,
      setPlan,
      setGoals,
      setProfile,
      updateNote,
      deleteAttempt,
      markAchievementsSeen,
      resetAll,
      importState,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function addDaysKey(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
