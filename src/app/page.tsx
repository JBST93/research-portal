import { getAllProtocolData } from "@/lib/defillama";
import { getAllProposals } from "@/lib/snapshot";
import { generateAlerts } from "@/lib/risk";
import { formatUSD } from "@/lib/format";
import ProtocolTable from "@/components/ProtocolTable";
import AlertsFeed from "@/components/AlertsFeed";
import MetricCard from "@/components/MetricCard";
import GovernanceFeed from "@/components/GovernanceFeed";

export const revalidate = 300;

export default async function Dashboard() {
  const [protocols, proposals] = await Promise.all([
    getAllProtocolData(),
    getAllProposals(15),
  ]);
  const alerts = generateAlerts(protocols);

  const activeProposals = proposals.filter((p) => p.state === "active");
  const recentProposals = proposals.slice(0, 10);

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
          label="Active Proposals"
          value={activeProposals.length.toString()}
          subValue={activeProposals.length > 0 ? "Votes open" : "None"}
          subColor={activeProposals.length > 0 ? "text-terminal-amber" : "text-terminal-muted"}
        />
      </div>

      {/* Alerts */}
      <AlertsFeed alerts={alerts} />

      {/* Protocol table */}
      <ProtocolTable protocols={protocols} />

      {/* Governance */}
      <GovernanceFeed
        proposals={recentProposals}
        showProtocol={true}
        title="Governance — Recent Proposals"
      />
    </div>
  );
}
