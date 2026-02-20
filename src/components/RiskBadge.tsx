import { RiskLevel } from "@/types";
import { getRiskLabel, getRiskColor } from "@/lib/risk";

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const label = getRiskLabel(level);
  const color = getRiskColor(level);

  const blocks = Array.from({ length: 4 }, (_, i) => {
    const filled = i < level;
    return (
      <span
        key={i}
        className={`inline-block w-2 h-3 ${filled ? getBgColor(level) : "bg-terminal-border"}`}
      />
    );
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">{blocks}</div>
      <span className={`text-xs ${color}`}>{label}</span>
    </div>
  );
}

function getBgColor(level: RiskLevel): string {
  switch (level) {
    case 1:
      return "bg-terminal-green";
    case 2:
      return "bg-terminal-amber";
    case 3:
      return "bg-terminal-red";
    case 4:
      return "bg-red-600";
  }
}
