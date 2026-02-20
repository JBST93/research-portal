export function formatUSD(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatPercentColor(value: number | null): string {
  if (value === null || value === undefined) return "text-terminal-muted";
  if (value > 0) return "text-terminal-green";
  if (value < 0) return "text-terminal-red";
  return "text-terminal-muted";
}
