import Link from "next/link";
import { getDexVolumes } from "@/lib/defillama";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";
import MetricCard from "@/components/MetricCard";
import DexTable from "@/components/DexTable";

export const revalidate = 300;

export default async function DexPage() {
  const { dexes, totalVolume24h, totalVolume7d } = await getDexVolumes(100);

  const top5Volume = dexes
    .slice(0, 5)
    .reduce((sum, d) => sum + d.volume24h, 0);
  const top5Dominance =
    totalVolume24h > 0 ? (top5Volume / totalVolume24h) * 100 : 0;

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-bb-white uppercase tracking-wider">
            DEX Volumes
          </h1>
          <span className="text-xxs text-bb-muted">
            {dexes.length} exchanges tracked
          </span>
        </div>
        <Link
          href="/"
          className="text-xxs text-bb-dim hover:text-bb-orange uppercase tracking-wider font-mono transition"
        >
          &larr; Dashboard
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard label="Total 24h Volume" value={formatUSD(totalVolume24h)} />
        <MetricCard label="Total 7d Volume" value={formatUSD(totalVolume7d)} />
        <MetricCard label="DEXes Tracked" value={dexes.length.toString()} />
        <MetricCard
          label="Top 5 Dominance"
          value={`${top5Dominance.toFixed(1)}%`}
          subValue={dexes
            .slice(0, 5)
            .map((d) => d.name)
            .join(", ")}
        />
      </div>

      {/* Table */}
      <DexTable dexes={dexes} />
    </div>
  );
}
