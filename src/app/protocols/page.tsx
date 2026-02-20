import Link from "next/link";
import { getTopProtocols } from "@/lib/defillama";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";

export const revalidate = 300;

export default async function ProtocolsPage() {
  const protocols = await getTopProtocols(100);

  const totalTvl = protocols.reduce((sum, p) => sum + p.tvl, 0);

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-bb-white uppercase tracking-wider">
            Top 100 Protocols
          </h1>
          <span className="text-xxs text-bb-muted">
            Total TVL: {formatUSD(totalTvl)}
          </span>
        </div>
        <Link
          href="/"
          className="text-xxs text-bb-dim hover:text-bb-orange uppercase tracking-wider font-mono transition"
        >
          &larr; Watchlist
        </Link>
      </div>

      <div className="bg-bb-panel border border-bb-border">
        <div className="bb-header">Protocol Rankings</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-bb-border text-bb-muted text-xxs uppercase tracking-wider">
                <th className="text-left px-3 py-2 w-8">#</th>
                <th className="text-left px-3 py-2">Protocol</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-right px-3 py-2">TVL</th>
                <th className="text-right px-3 py-2">24h</th>
                <th className="text-right px-3 py-2">7d</th>
                <th className="text-right px-3 py-2">Fees 24h</th>
                <th className="text-left px-3 py-2">Chains</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/protocol/${p.slug}`}
                  className="contents"
                >
                  <tr className="bb-row cursor-pointer">
                    <td className="px-3 py-1.5 text-bb-dim">{i + 1}</td>
                    <td className="px-3 py-1.5 text-bb-white font-semibold">
                      {p.name}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="text-xxs text-bb-orange-dim">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right text-bb-white">
                      {formatUSD(p.tvl)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right ${formatPercentColor(p.change_1d)}`}
                    >
                      {formatPercent(p.change_1d)}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-right ${formatPercentColor(p.change_7d)}`}
                    >
                      {formatPercent(p.change_7d)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-bb-text">
                      {formatUSD(p.fees24h)}
                    </td>
                    <td className="px-3 py-1.5 text-bb-muted text-xxs">
                      {p.chains.slice(0, 3).join(", ")}
                      {p.chains.length > 3 && ` +${p.chains.length - 3}`}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
