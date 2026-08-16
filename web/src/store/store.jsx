import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { todayKey } from '../lib/date';
import * as repo from '../db/repo';
import { mergeLogbook } from '../db/logbook';
import {
  exec,
  exportBytes,
  importBytes,
  isOpen,
  openDatabase,
  resetDatabase,
  save,
} from '../db/database';

import { BOX_DAYS, DEFAULT_STATE } from './defaults';

export { DEFAULT_STATE };

const StoreContext = createContext(null);

function addDaysKey(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [status, setStatus] = useState({ ready: false, error: null, migrated: false });

  // Open SQLite, lift any legacy localStorage data, then hydrate.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await openDatabase();
        const migrated = repo.migrateLegacyState();
        // Attempts recorded in the repo, merged before the state is read so the
        // first render already reflects them. Failures here are non-fatal.
        const merged = await mergeLogbook();
        if (merged > 0) await save();
        const loaded = repo.loadState();
        if (cancelled) return;
        setState(loaded);
        setStatus({ ready: true, error: null, migrated });
      } catch (err) {
        if (cancelled) return;
        // Private mode, no IndexedDB, or no WASM: the app still runs, it just
        // will not remember this session.
        console.warn('DSA HERO: database unavailable, running in memory —', err?.message ?? err);
        setStatus({ ready: false, error: err?.message ?? String(err), migrated: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Writes go to SQLite first, then mirror into React state. */
  const persist = useCallback((write) => {
    if (!isOpen()) return;
    try {
      write();
    } catch (err) {
      console.warn('DSA HERO: write failed —', err?.message ?? err);
    }
  }, []);

  const logAttempt = useCallback(
    (entry) => {
      const stamp = entry.date ?? todayKey();
      setState((prev) => {
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
          code: entry.code ?? '',
          language: entry.language ?? 'java',
          mode: entry.mode ?? 'practice',
        };

        const solvedClean = entry.outcome === 'solved-clean';
        const prevBox = prev.revisions[entry.problemId]?.box ?? -1;
        const box = solvedClean ? Math.min(prevBox + 1, BOX_DAYS.length - 1) : 0;
        const revision = { box, due: addDaysKey(stamp, BOX_DAYS[box]) };

        persist(() => repo.insertAttempt(attempt, revision));

        return {
          ...prev,
          attempts: [...prev.attempts, attempt],
          revisions: { ...prev.revisions, [entry.problemId]: revision },
        };
      });
    },
    [persist]
  );

  const setPlan = useCallback(
    (dateKey, items, kind) => {
      persist(() => repo.savePlan(dateKey, items, kind));
      setState((prev) => ({
        ...prev,
        plans: {
          ...prev.plans,
          [dateKey]: {
            kind,
            generatedAt: new Date().toISOString(),
            problemIds: items.map((i) => i.problemId),
            roles: items.map((i) => i.role),
            reasons: items.map((i) => i.reason),
          },
        },
      }));
    },
    [persist]
  );

  const setGoals = useCallback(
    (goals) =>
      setState((prev) => {
        const next = { ...prev.goals, ...goals };
        persist(() => repo.putSetting('goals', next));
        return { ...prev, goals: next };
      }),
    [persist]
  );

  const setProfile = useCallback(
    (profile) =>
      setState((prev) => {
        const next = { ...prev.profile, ...profile };
        persist(() => repo.putSetting('profile', next));
        return { ...prev, profile: next };
      }),
    [persist]
  );

  const markAchievementsSeen = useCallback(
    (ids) =>
      setState((prev) => {
        const next = [...new Set([...prev.seenAchievements, ...ids])];
        persist(() => repo.putSetting('seenAchievements', next));
        return { ...prev, seenAchievements: next };
      }),
    [persist]
  );

  const updateNote = useCallback(
    (attemptId, notes) => {
      persist(() => repo.updateNote(attemptId, notes));
      setState((prev) => ({
        ...prev,
        attempts: prev.attempts.map((a) => (a.id === attemptId ? { ...a, notes } : a)),
      }));
    },
    [persist]
  );

  const updateCode = useCallback(
    (attemptId, code) => {
      persist(() => repo.updateCode(attemptId, code));
      setState((prev) => ({
        ...prev,
        attempts: prev.attempts.map((a) => (a.id === attemptId ? { ...a, code } : a)),
      }));
    },
    [persist]
  );

  const deleteAttempt = useCallback(
    (attemptId) => {
      persist(() => repo.deleteAttempt(attemptId));
      setState((prev) => ({ ...prev, attempts: prev.attempts.filter((a) => a.id !== attemptId) }));
    },
    [persist]
  );

  const resetAll = useCallback(async () => {
    if (isOpen()) await resetDatabase();
    setState({ ...DEFAULT_STATE, startedOn: todayKey() });
  }, []);

  /** Replaces the database from an exported .sqlite file. */
  const importDatabase = useCallback(async (arrayBuffer) => {
    await importBytes(arrayBuffer);
    setState(repo.loadState());
  }, []);

  const exportDatabase = useCallback(async () => {
    await save();
    return exportBytes();
  }, []);

  /** Read-only escape hatch for the SQL console. */
  const runSql = useCallback((sql) => exec(sql), []);

  const value = useMemo(
    () => ({
      state,
      status,
      logAttempt,
      setPlan,
      setGoals,
      setProfile,
      updateNote,
      updateCode,
      deleteAttempt,
      markAchievementsSeen,
      resetAll,
      importDatabase,
      exportDatabase,
      runSql,
    }),
    [
      state,
      status,
      logAttempt,
      setPlan,
      setGoals,
      setProfile,
      updateNote,
      updateCode,
      deleteAttempt,
      markAchievementsSeen,
      resetAll,
      importDatabase,
      exportDatabase,
      runSql,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
