/** Linear progress meter. `tone` picks the fill: gradient | success | streak. */
export default function ProgressBar({ percent, active = true, tone = 'gradient', height = 6 }) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className="meter"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className={`meter-fill meter-${tone}`}
        style={{ width: active ? `${clamped}%` : 0 }}
      />
    </div>
  );
}
