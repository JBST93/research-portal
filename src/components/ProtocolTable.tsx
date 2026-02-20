import Link from "next/link";
import { ProtocolData } from "@/types";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";
import { calculateRisk } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

interface ProtocolTableProps {
  protocols: ProtocolData[];
}

export default function ProtocolTable({ protocols }: ProtocolTableProps) {
  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header">Protocol Overview</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-bb-border text-bb-muted text-xxs uppercase tracking-wider">
              <th className="text-left px-3 py-2">Protocol</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-right px-3 py-2">TVL</th>
              <th className="text-right px-3 py-2">24h</th>
              <th className="text-right px-3 py-2">7d</th>
              <th className="text-right px-3 py-2">Fees 24h</th>
              <th className="text-left px-3 py-2">Risk</th>
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
                  <tr className="bb-row cursor-pointer">
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
                    <td className="px-3 py-1.5">
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
