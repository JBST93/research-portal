"use client";

interface TvlChartProps {
  data: { date: number; tvl: number }[];
}

export default function TvlChart({ data }: TvlChartProps) {
  if (data.length === 0) return null;

  const maxTvl = Math.max(...data.map((d) => d.tvl));
  const minTvl = Math.min(...data.map((d) => d.tvl));
  const range = maxTvl - minTvl || 1;

  const width = 800;
  const height = 200;
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.tvl - minTvl) / range) * chartH;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Area fill
  const areaPoints = [
    `${padding.left},${padding.top + chartH}`,
    ...points,
    `${padding.left + chartW},${padding.top + chartH}`,
  ].join(" ");

  // X-axis labels (first, middle, last)
  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
  const labels = labelIndices.map((i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    label: new Date(data[i].date * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="border border-terminal-border p-4">
      <div className="text-xs text-terminal-muted uppercase tracking-wider mb-3">
        TVL — Last 90 Days
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#tvlGradient)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
        />
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={height - 5}
            textAnchor="middle"
            className="fill-terminal-muted"
            fontSize="11"
            fontFamily="monospace"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
