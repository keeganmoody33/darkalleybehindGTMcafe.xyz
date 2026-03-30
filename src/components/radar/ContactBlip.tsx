"use client";

export interface BlipData {
  id: string;
  title: string;
  companyName: string | null;
  overallScore: number;
  foundingScore: number;
  status: string;
}

function scoreToColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#047857";
  if (score >= 40) return "#71717a";
  if (score >= 20) return "#52525b";
  return "#3f3f46";
}

function scoreToSize(foundingScore: number): number {
  const base = 2.5;
  return base + (foundingScore / 100) * 2.5;
}

function statusToOpacity(status: string): number {
  if (status === "archived") return 0.2;
  if (status === "new") return 1;
  return 0.7;
}

interface ContactBlipProps {
  blip: BlipData;
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function ContactBlip({
  blip,
  x,
  y,
  isSelected,
  isHovered,
  onHover,
  onClick,
}: ContactBlipProps) {
  const color = scoreToColor(blip.overallScore);
  const size = scoreToSize(blip.foundingScore);
  const opacity = statusToOpacity(blip.status);
  const showLabel = isSelected || isHovered;

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(blip.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(blip.id)}
      opacity={opacity}
    >
      {blip.overallScore >= 80 && (
        <circle cx={x} cy={y} r={size + 3} fill="none" stroke={color} strokeWidth={0.4} opacity={0.4}>
          <animate attributeName="r" from={size + 2} to={size + 6} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {isSelected && (
        <circle cx={x} cy={y} r={size + 4} fill="none" stroke="#34d399" strokeWidth={1} opacity={0.6} />
      )}

      <circle cx={x} cy={y} r={size} fill={color} />
      <circle cx={x} cy={y} r={size * 0.4} fill="white" opacity={0.3} />

      {showLabel && (
        <g>
          <rect
            x={x + size + 4}
            y={y - 8}
            width={Math.max(blip.title.length * 4.5, 60)}
            height={16}
            rx={3}
            fill="#18181b"
            stroke="#3f3f46"
            strokeWidth={0.5}
          />
          <text
            x={x + size + 7}
            y={y + 3}
            fill="#fafafa"
            fontSize={8}
            fontFamily="var(--font-geist-sans)"
          >
            {blip.title.length > 30
              ? blip.title.slice(0, 28) + "…"
              : blip.title}
          </text>
        </g>
      )}
    </g>
  );
}
