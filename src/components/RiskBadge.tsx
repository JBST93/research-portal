import { RiskLevel } from "@/types";
import { getRiskLabel } from "@/lib/risk";

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const label = getRiskLabel(level);

  const blocks = Array.from({ length: 4 }, (_, i) => {
    const filled = i < level;
    return (
      <span
        key={i}
        className={`inline-block w-1.5 h-3 ${filled ? getBgColor(level) : "bg-bb-dim"}`}
      />
    );
  });

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-px">{blocks}</div>
      <span className={`text-xxs ${getTextColor(level)}`}>{label}</span>
    </div>
  );
}

function getBgColor(level: RiskLevel): string {
  switch (level) {
    case 1: return "bg-bb-green";
    case 2: return "bg-bb-amber";
    case 3: return "bg-bb-red";
    case 4: return "bg-red-600";
  }
}

function getTextColor(level: RiskLevel): string {
  switch (level) {
    case 1: return "text-bb-green";
    case 2: return "text-bb-amber";
    case 3: return "text-bb-red";
    case 4: return "text-red-600";
  }
}
