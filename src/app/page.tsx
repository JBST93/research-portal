import { getAllProtocolData } from "@/lib/defillama";
import { generateAlerts } from "@/lib/risk";
import { formatUSD } from "@/lib/format";
import ProtocolTable from "@/components/ProtocolTable";
import AlertsFeed from "@/components/AlertsFeed";
import MetricCard from "@/components/MetricCard";

export const revalidate = 300;

export default async function Dashboard() {
  const protocols = await getAllProtocolData();
  const alerts = generateAlerts(protocols);

  const totalTvl = protocols.reduce((sum, p) => sum + p.tvl, 0);
  const totalFees = protocols.reduce((sum, p) => sum + (p.fees24h || 0), 0);
  const avgChange = protocols.reduce((sum, p) => sum + (p.change_1d || 0), 0) / protocols.length;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Watchlist TVL"
          value={formatUSD(totalTvl)}
        />
        <MetricCard
          label="Protocols"
          value={protocols.length.toString()}
        />
        <MetricCard
          label="Total Fees 24h"
          value={formatUSD(totalFees)}
        />
        <MetricCard
          label="Avg TVL Change 24h"
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          subColor={avgChange >= 0 ? "text-terminal-green" : "text-terminal-red"}
        />
      </div>

      {/* Alerts */}
      <AlertsFeed alerts={alerts} />

      {/* Protocol table */}
      <ProtocolTable protocols={protocols} />
    </div>
  );
}
