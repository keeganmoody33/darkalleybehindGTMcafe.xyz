interface PulseRingsProps {
  center: number;
  maxRadius: number;
}

const RING_THRESHOLDS = [80, 60, 40, 20];

export function PulseRings({ center, maxRadius }: PulseRingsProps) {
  return (
    <g>
      {RING_THRESHOLDS.map((threshold) => {
        const ratio = 1 - threshold / 100;
        const r = maxRadius * (0.08 + ratio * 0.92);
        const opacity = 0.08 + (threshold / 100) * 0.12;
        return (
          <circle
            key={threshold}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#34d399"
            strokeWidth={0.5}
            opacity={opacity}
            strokeDasharray="2 4"
          />
        );
      })}

      <line
        x1={center}
        y1={center - maxRadius}
        x2={center}
        y2={center + maxRadius}
        stroke="#3f3f46"
        strokeWidth={0.3}
      />
      <line
        x1={center - maxRadius}
        y1={center}
        x2={center + maxRadius}
        y2={center}
        stroke="#3f3f46"
        strokeWidth={0.3}
      />
    </g>
  );
}
