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
  const avgChange =
    protocols.reduce((sum, p) => sum + (p.change_1d || 0), 0) / protocols.length;

  return (
    <div className="space-y-3 pb-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard label="Watchlist TVL" value={formatUSD(totalTvl)} />
        <MetricCard label="Protocols" value={protocols.length.toString()} />
        <MetricCard label="Fees 24h" value={formatUSD(totalFees)} />
        <MetricCard
          label="Active Votes"
          value={activeProposals.length.toString()}
          subValue={
            activeProposals.length > 0 ? "Votes open now" : "No active votes"
          }
          subColor={
            activeProposals.length > 0 ? "text-bb-amber" : "text-bb-muted"
          }
        />
      </div>

      {/* Two-column layout: table + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Main: protocol table */}
        <div className="lg:col-span-2 space-y-2">
          <ProtocolTable protocols={protocols} />
        </div>

        {/* Sidebar: alerts + governance */}
        <div className="space-y-2">
          <AlertsFeed alerts={alerts} />
          <GovernanceFeed
            proposals={recentProposals}
            showProtocol={true}
            title="Governance"
          />
        </div>
      </div>
    </div>
  );
}
