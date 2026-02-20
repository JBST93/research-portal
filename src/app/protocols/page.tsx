import Link from "next/link";
import { getTopProtocols } from "@/lib/defillama";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";

export const revalidate = 300;

export default async function ProtocolsPage() {
  const protocols = await getTopProtocols(100);

  const totalTvl = protocols.reduce((sum, p) => sum + p.tvl, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-terminal-text">
            Top 100 Protocols by TVL
          </h1>
          <p className="text-sm text-terminal-muted mt-1">
            Total: {formatUSD(totalTvl)}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-terminal-dim hover:text-terminal-green font-mono transition"
        >
          &larr; Watchlist
        </Link>
      </div>

      <div className="border border-terminal-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-muted text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 w-10">#</th>
                <th className="text-left px-4 py-3">Protocol</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-right px-4 py-3">TVL</th>
                <th className="text-right px-4 py-3">24h</th>
                <th className="text-right px-4 py-3">7d</th>
                <th className="text-right px-4 py-3">Fees 24h</th>
                <th className="text-left px-4 py-3">Chains</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/protocol/${p.slug}`}
                  className="contents"
                >
                  <tr className="border-b border-terminal-border hover:bg-terminal-surface cursor-pointer transition-colors">
                    <td className="px-4 py-2 text-terminal-dim">{i + 1}</td>
                    <td className="px-4 py-2 text-terminal-text font-semibold">
                      {p.name}
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs px-2 py-0.5 border border-terminal-border-bright text-terminal-muted">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-terminal-text">
                      {formatUSD(p.tvl)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${formatPercentColor(p.change_1d)}`}
                    >
                      {formatPercent(p.change_1d)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${formatPercentColor(p.change_7d)}`}
                    >
                      {formatPercent(p.change_7d)}
                    </td>
                    <td className="px-4 py-2 text-right text-terminal-text">
                      {formatUSD(p.fees24h)}
                    </td>
                    <td className="px-4 py-2 text-terminal-muted text-xs">
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
