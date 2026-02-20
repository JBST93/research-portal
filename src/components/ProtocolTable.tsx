import Link from "next/link";
import { ProtocolData, RiskLevel } from "@/types";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";
import { calculateRisk } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

interface ProtocolTableProps {
  protocols: ProtocolData[];
}

export default function ProtocolTable({ protocols }: ProtocolTableProps) {
  return (
    <div className="border border-terminal-border">
      <div className="px-4 py-3 border-b border-terminal-border">
        <span className="text-xs text-terminal-muted uppercase tracking-wider">
          Protocol Overview
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-terminal-border text-terminal-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Protocol</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">TVL</th>
              <th className="text-right px-4 py-3">24h</th>
              <th className="text-right px-4 py-3">7d</th>
              <th className="text-right px-4 py-3">Fees 24h</th>
              <th className="text-left px-4 py-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {protocols.map((p) => {
              const risk = calculateRisk(p);
              return (
                <Link
                  key={p.slug}
                  href={`/protocol/${p.slug}`}
                  className="contents"
                >
                  <tr className="border-b border-terminal-border hover:bg-terminal-surface cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-terminal-text font-semibold">
                      {p.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 border border-terminal-border-bright text-terminal-muted">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-terminal-text">
                      {formatUSD(p.tvl)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${formatPercentColor(p.change_1d)}`}
                    >
                      {formatPercent(p.change_1d)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${formatPercentColor(p.change_7d)}`}
                    >
                      {formatPercent(p.change_7d)}
                    </td>
                    <td className="px-4 py-3 text-right text-terminal-text">
                      {formatUSD(p.fees24h)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={risk} />
                    </td>
                  </tr>
                </Link>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
