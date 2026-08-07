import { useId } from 'react';
import useCountUp from '../../hooks/useCountUp';

/**
 * Circular progress indicator. The arc and the numeral animate from the same
 * count-up value, so they can never disagree mid-animation.
 */
export default function ProgressRing({
  percent,
  size = 148,
  stroke = 10,
  active = true,
  label = 'complete',
}) {
  const gradId = useId();
  const shown = useCountUp(percent, { active, decimals: 1, duration: 1400 });

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(shown, 100) / 100);

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--grad-from)" />
            <stop offset="55%" stopColor="var(--grad-mid)" />
            <stop offset="100%" stopColor="var(--grad-to)" />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          className="ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      <div className="ring-center">
        <span className="ring-value">
          {shown.toFixed(1)}
          <span className="ring-unit">%</span>
        </span>
        <span className="ring-label">{label}</span>
      </div>
    </div>
  );
}
