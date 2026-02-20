"use client";

import { formatUSD } from "@/lib/format";

interface TvlChartProps {
  data: { date: number; tvl: number }[];
}

export default function TvlChart({ data }: TvlChartProps) {
  if (data.length === 0) return null;

  const maxTvl = Math.max(...data.map((d) => d.tvl));
  const minTvl = Math.min(...data.map((d) => d.tvl));
  const range = maxTvl - minTvl || 1;

  const width = 800;
  const height = 160;
  const padding = { top: 8, right: 8, bottom: 24, left: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.tvl - minTvl) / range) * chartH;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  const areaPoints = [
    `${padding.left},${padding.top + chartH}`,
    ...points,
    `${padding.left + chartW},${padding.top + chartH}`,
  ].join(" ");

  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
  const labels = labelIndices.map((i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    label: new Date(data[i].date * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>TVL — 90 Days</span>
        <div className="flex gap-4 normal-case tracking-normal font-normal text-xxs">
          <span className="text-bb-muted">
            High: <span className="text-bb-white">{formatUSD(maxTvl)}</span>
          </span>
          <span className="text-bb-muted">
            Low: <span className="text-bb-white">{formatUSD(minTvl)}</span>
          </span>
        </div>
      </div>
      <div className="p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#tvlGradient)" />
          <polyline
            points={polyline}
            fill="none"
            stroke="#ff8c00"
            strokeWidth="1.5"
          />
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={height - 4}
              textAnchor="middle"
              fill="#3d4f63"
              fontSize="10"
              fontFamily="monospace"
            >
              {l.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
