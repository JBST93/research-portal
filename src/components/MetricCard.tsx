interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  subColor?: string;
}

export default function MetricCard({
  label,
  value,
  subValue,
  subColor = "text-terminal-muted",
}: MetricCardProps) {
  return (
    <div className="border border-terminal-border p-4">
      <div className="text-xs text-terminal-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xl text-terminal-text font-mono">{value}</div>
      {subValue && (
        <div className={`text-xs font-mono mt-1 ${subColor}`}>{subValue}</div>
      )}
    </div>
  );
}
