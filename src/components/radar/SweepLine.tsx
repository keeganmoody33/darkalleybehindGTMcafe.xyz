"use client";

interface SweepLineProps {
  center: number;
  radius: number;
}

export function SweepLine({ center, radius }: SweepLineProps) {
  return (
    <g>
      <defs>
        <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
        </linearGradient>

        <filter id="sweepGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - radius}
        stroke="url(#sweepGrad)"
        strokeWidth={1.5}
        filter="url(#sweepGlow)"
        className="origin-center animate-[radar-sweep_6s_linear_infinite]"
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      <path
        d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius * Math.sin(Math.PI / 9)} ${center - radius * Math.cos(Math.PI / 9)} Z`}
        fill="#34d399"
        opacity={0.04}
        className="origin-center animate-[radar-sweep_6s_linear_infinite]"
        style={{ transformOrigin: `${center}px ${center}px` }}
      />
    </g>
  );
}
