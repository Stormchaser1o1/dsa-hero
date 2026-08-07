import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion';

/** Ring gauge with an animated sweep and a value in the middle. */
export default function Donut({
  percent,
  size = 150,
  stroke = 12,
  label = 'Overall Progress',
  value,
  hue = 'var(--success)',
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? percent : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) {
      setShown(percent);
      return undefined;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (percent - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [percent, reduced]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, shown));

  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hue}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="donut-center">
        <span className="donut-value">{value ?? `${Math.round(clamped)}%`}</span>
        <span className="donut-label">{label}</span>
      </div>
    </div>
  );
}
