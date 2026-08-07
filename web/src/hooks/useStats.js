import { useMemo } from 'react';
import { useStore } from '../store/store';
import { computeStats } from '../engine/stats';

/** Derived view of the whole journey. Recomputed only when state changes. */
export default function useStats() {
  const { state } = useStore();
  return useMemo(() => computeStats(state), [state]);
}
