"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SweepLine } from "@/components/radar/SweepLine";
import { PulseRings } from "@/components/radar/PulseRings";
import { ContactBlip, type BlipData } from "@/components/radar/ContactBlip";

interface RadarCanvasProps {
  blips: BlipData[];
  selectedBlipId?: string | null;
  onSelectBlip?: (id: string) => void;
  className?: string;
}

const VIEWBOX_SIZE = 500;
const CENTER = VIEWBOX_SIZE / 2;

function scoreToDistance(score: number): number {
  const maxRadius = CENTER * 0.85;
  const minRadius = CENTER * 0.08;
  const normalized = Math.max(0, Math.min(100, score)) / 100;
  return maxRadius - normalized * (maxRadius - minRadius);
}

function titleFamilyToAngle(title: string): number {
  const lower = title.toLowerCase();
  if (lower.includes("founding") || lower.includes("founder")) return 45;
  if (lower.includes("growth")) return 135;
  if (lower.includes("revops") || lower.includes("revenue")) return 225;
  if (lower.includes("gtm") || lower.includes("go-to-market")) return 315;
  if (lower.includes("demand") || lower.includes("marketing")) return 180;
  if (lower.includes("head") || lower.includes("vp")) return 90;
  const hash = lower.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 360;
}

function polarToCartesian(
  distance: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: CENTER + distance * Math.cos(rad),
    y: CENTER + distance * Math.sin(rad),
  };
}

export function RadarCanvas({
  blips,
  selectedBlipId,
  onSelectBlip,
  className,
}: RadarCanvasProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positioned = useMemo(() => {
    return blips.map((b, idx) => {
      const dist = scoreToDistance(b.overallScore);
      const baseAngle = titleFamilyToAngle(b.title);
      const jitter = ((idx * 37) % 30) - 15;
      const { x, y } = polarToCartesian(dist, baseAngle + jitter);
      return { ...b, x, y };
    });
  }, [blips]);

  const handleClick = useCallback(
    (id: string) => {
      onSelectBlip?.(id);
    },
    [onSelectBlip],
  );

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="h-full w-full"
      >
        <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill="#09090b" />

        <PulseRings center={CENTER} maxRadius={CENTER * 0.85} />
        <SweepLine center={CENTER} radius={CENTER * 0.88} />

        <circle cx={CENTER} cy={CENTER} r={3} fill="#34d399" />
        <circle cx={CENTER} cy={CENTER} r={6} fill="none" stroke="#34d399" strokeWidth={0.5} opacity={0.4} />

        {positioned.map((b) => (
          <ContactBlip
            key={b.id}
            blip={b}
            x={b.x}
            y={b.y}
            isSelected={b.id === selectedBlipId}
            isHovered={b.id === hoveredId}
            onHover={setHoveredId}
            onClick={handleClick}
          />
        ))}
      </svg>
    </div>
  );
}
