import Link from "next/link";
import { getVolumeData } from "@/lib/defillama";
import { formatUSD } from "@/lib/format";
import MetricCard from "@/components/MetricCard";
import DexTable from "@/components/DexTable";
import VolumeTabs from "@/components/VolumeTabs";

export const revalidate = 300;

export default async function DexPage() {
  const [spotData, perpData] = await Promise.all([
    getVolumeData("dexs", 100),
    getVolumeData("derivatives", 100),
  ]);

  const combinedVolume24h = spotData.totalVolume24h + perpData.totalVolume24h;

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-bb-white uppercase tracking-wider">
            Volume Monitor
          </h1>
        </div>
        <Link
          href="/"
          className="text-xxs text-bb-dim hover:text-bb-orange uppercase tracking-wider font-mono transition"
        >
          &larr; Dashboard
        </Link>
      </div>

      {/* Combined summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          label="Combined 24h Vol"
          value={formatUSD(combinedVolume24h)}
        />
        <MetricCard
          label="Spot DEX 24h"
          value={formatUSD(spotData.totalVolume24h)}
          subValue={`${spotData.dexes.length} exchanges`}
        />
        <MetricCard
          label="Perps 24h"
          value={formatUSD(perpData.totalVolume24h)}
          subValue={`${perpData.dexes.length} exchanges`}
        />
        <MetricCard
          label="Perps / Spot Ratio"
          value={
            spotData.totalVolume24h > 0
              ? `${(perpData.totalVolume24h / spotData.totalVolume24h).toFixed(1)}x`
              : "—"
          }
        />
      </div>

      {/* Tabbed tables */}
      <VolumeTabs spotDexes={spotData.dexes} perpDexes={perpData.dexes} />
    </div>
  );
}
