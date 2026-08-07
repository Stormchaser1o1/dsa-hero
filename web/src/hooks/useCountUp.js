import { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion';

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Animates 0 → target on a rAF loop. Skips straight to the target when
 *  reduced motion is on or the element hasn't been revealed yet. */
export default function useCountUp(target, { duration = 1100, active = true, decimals = 0 } = {}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const next = target * easeOutExpo(t);
      setValue(Number(next.toFixed(decimals)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, active, reduced, decimals]);

  return value;
}
