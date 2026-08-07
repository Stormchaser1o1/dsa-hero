import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** True when the OS asks for reduced motion. Drives JS-run animations;
 *  CSS transitions are neutralised separately in base.css. */
export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
