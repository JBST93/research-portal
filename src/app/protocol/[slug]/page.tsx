import { notFound } from "next/navigation";
import Link from "next/link";
import { getProtocolDetail } from "@/lib/defillama";
import { getProtocolConfig } from "@/lib/protocols";
import { getProtocolProposals } from "@/lib/snapshot";
import {
  getHLOverview,
  getFundingComparisons,
  getHLPVault,
} from "@/lib/hyperliquid";
import { calculateRisk } from "@/lib/risk";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";
import MetricCard from "@/components/MetricCard";
import RiskBadge from "@/components/RiskBadge";
import TvlChart from "@/components/TvlChart";
import GovernanceFeed from "@/components/GovernanceFeed";
import HLMarketsTable from "@/components/HLMarketsTable";
import HLFundingComparisonTable from "@/components/HLFundingComparison";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProtocolPage({ params }: Props) {
  const { slug } = await params;
  const config = getProtocolConfig(slug);
  if (!config) notFound();

  const isHL = slug === "hyperliquid";

  const [detail, proposals, hlOverview, hlFunding, hlVault] = await Promise.all(
    [
      getProtocolDetail(slug),
      config.snapshotSpace
        ? getProtocolProposals(config.snapshotSpace, 10)
        : Promise.resolve([]),
      isHL ? getHLOverview() : Promise.resolve(null),
      isHL ? getFundingComparisons() : Promise.resolve([]),
      isHL ? getHLPVault() : Promise.resolve(null),
    ]
  );
  if (!detail) notFound();

  const risk = calculateRisk({
    slug: detail.slug,
    name: detail.name,
    category: detail.category,
    tvl: detail.tvl,
    change_1d: detail.change_1d,
    change_7d: detail.change_7d,
    chains: detail.chains,
    logo: detail.logo,
    fees24h: detail.fees24h,
    revenue24h: detail.revenue24h,
    volume24h: detail.volume24h,
  });

  // Sort chain TVLs descending
  const sortedChains = Object.entries(detail.chainTvls).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/"
        className="text-terminal-dim hover:text-terminal-green text-sm font-mono transition"
      >
        &larr; Back to dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-terminal-text">
            {detail.name}
          </h1>
          <p className="text-sm text-terminal-muted mt-1">
            {config.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-2 py-1 border border-terminal-border-bright text-terminal-muted">
            {config.category}
          </span>
          <RiskBadge level={risk} />
        </div>
      </div>

      {/* Key metrics — enhanced for Hyperliquid */}
      {isHL && hlOverview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <MetricCard
            label="TVL"
            value={formatUSD(detail.tvl)}
            subValue={formatPercent(detail.change_1d) + " 24h"}
            subColor={formatPercentColor(detail.change_1d)}
          />
          <MetricCard
            label="Total Open Interest"
            value={formatUSD(hlOverview.totalOI)}
          />
          <MetricCard
            label="24h Volume"
            value={formatUSD(hlOverview.totalVolume24h)}
          />
          <MetricCard
            label="Active Markets"
            value={hlOverview.marketCount.toString()}
          />
          <MetricCard
            label="Fees 24h"
            value={formatUSD(detail.fees24h)}
            subValue={
              detail.fees30d
                ? `${formatUSD(detail.fees30d)} 30d`
                : undefined
            }
          />
          {hlVault && (
            <MetricCard
              label="HLP Vault AUM"
              value={formatUSD(hlVault.aum)}
              subValue={`PnL today: ${formatUSD(hlVault.pnlDay)}`}
              subColor={
                hlVault.pnlDay >= 0
                  ? "text-terminal-green"
                  : "text-terminal-red"
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="TVL"
            value={formatUSD(detail.tvl)}
            subValue={formatPercent(detail.change_1d) + " 24h"}
            subColor={formatPercentColor(detail.change_1d)}
          />
          <MetricCard
            label="Fees 24h"
            value={formatUSD(detail.fees24h)}
            subValue={
              detail.fees30d
                ? `${formatUSD(detail.fees30d)} 30d`
                : undefined
            }
          />
          <MetricCard
            label="Revenue 24h"
            value={formatUSD(detail.revenue24h)}
            subValue={
              detail.revenue30d
                ? `${formatUSD(detail.revenue30d)} 30d`
                : undefined
            }
          />
          <MetricCard
            label="Chains"
            value={detail.chains.length.toString()}
            subValue={detail.chains.slice(0, 3).join(", ")}
          />
        </div>
      )}

      {/* TVL Chart */}
      <TvlChart data={detail.tvlHistory} />

      {/* Hyperliquid-specific sections */}
      {isHL && hlOverview && (
        <>
          {/* Funding comparison */}
          {hlFunding.length > 0 && (
            <HLFundingComparisonTable comparisons={hlFunding} />
          )}

          {/* Markets table */}
          <HLMarketsTable markets={hlOverview.markets} />
        </>
      )}

      {/* Chain breakdown */}
      {sortedChains.length > 0 && !isHL && (
        <div className="border border-terminal-border p-4">
          <div className="text-xs text-terminal-muted uppercase tracking-wider mb-3">
            TVL by Chain
          </div>
          <div className="space-y-2">
            {sortedChains.map(([chain, tvl]) => {
              const pct = detail.tvl > 0 ? (tvl / detail.tvl) * 100 : 0;
              return (
                <div
                  key={chain}
                  className="flex items-center gap-3 font-mono text-sm"
                >
                  <span className="text-terminal-text w-28 truncate">
                    {chain}
                  </span>
                  <div className="flex-1 h-3 bg-terminal-border overflow-hidden">
                    <div
                      className="h-full bg-terminal-green/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-terminal-muted text-xs w-20 text-right">
                    {formatUSD(tvl)}
                  </span>
                  <span className="text-terminal-dim text-xs w-14 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Governance */}
      <GovernanceFeed
        proposals={proposals}
        showProtocol={false}
        title={`Governance — ${detail.name}`}
      />

      {/* Links */}
      <div className="border border-terminal-border p-4">
        <div className="text-xs text-terminal-muted uppercase tracking-wider mb-3">
          Links
        </div>
        <div className="flex gap-4 text-sm font-mono">
          {detail.url && (
            <a
              href={detail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-blue hover:underline"
            >
              Website
            </a>
          )}
          {detail.twitter && (
            <a
              href={`https://twitter.com/${detail.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-blue hover:underline"
            >
              Twitter
            </a>
          )}
          <a
            href={`https://defillama.com/protocol/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-terminal-blue hover:underline"
          >
            DeFiLlama
          </a>
        </div>
      </div>
    </div>
  );
}
