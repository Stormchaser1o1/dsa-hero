/** Tiny inline trend line. Renders nothing meaningful below two points. */
export default function Sparkline({ points, width = 220, height = 48, hue = 'var(--accent)' }) {
  if (!points || points.length < 2) {
    return <div className="spark-empty">Not enough data yet</div>;
  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => [i * step, height - ((p - min) / span) * (height - 6) - 3]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const id = `spark-${hue.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hue} stopOpacity="0.28" />
          <stop offset="100%" stopColor={hue} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={hue} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
