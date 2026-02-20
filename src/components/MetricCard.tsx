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
  subColor = "text-bb-muted",
}: MetricCardProps) {
  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bg-bb-header px-3 py-1 border-b border-bb-border">
        <span className="text-xxs text-bb-orange uppercase tracking-widest font-bold">
          {label}
        </span>
      </div>
      <div className="px-3 py-2">
        <div className="text-lg text-bb-white font-mono font-semibold">
          {value}
        </div>
        {subValue && (
          <div className={`text-xxs font-mono mt-0.5 ${subColor}`}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
