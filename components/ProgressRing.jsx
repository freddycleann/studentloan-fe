'use client';

export default function ProgressRing({
  value = 0,
  max = 1,
  size = 180,
  stroke = 14,
  label,
  sublabel,
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const dash = pct * circ;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdf7e2" />
            <stop offset="40%" stopColor="#ecc857" />
            <stop offset="80%" stopColor="#a87a1c" />
            <stop offset="100%" stopColor="#fdf7e2" />
          </linearGradient>
        </defs>
        <circle
          className="ring-bg"
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={stroke}
        />
        <circle
          className="ring-fg"
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl gold-text">{label ?? `${Math.round(pct * 100)}%`}</div>
          {sublabel && (
            <div className="mt-2 text-sm uppercase tracking-widest text-gold-200 font-medium">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
