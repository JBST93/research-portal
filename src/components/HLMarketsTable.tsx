"use client";

import { useState } from "react";
import { HLMarket } from "@/lib/hyperliquid";
import { formatUSD } from "@/lib/format";

interface HLMarketsTableProps {
  markets: HLMarket[];
}

type SortKey = "openInterestUsd" | "dayNtlVlm" | "funding" | "priceChange24h";

export default function HLMarketsTable({ markets }: HLMarketsTableProps) {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("openInterestUsd");

  const sorted = [...markets].sort((a, b) => {
    if (sortBy === "funding") return Math.abs(b.funding) - Math.abs(a.funding);
    return b[sortBy] - a[sortBy];
  });

  const displayed = showAll ? sorted : sorted.slice(0, 20);

  return (
    <div className="border border-terminal-border">
      <div className="px-4 py-3 border-b border-terminal-border flex items-center justify-between">
        <span className="text-xs text-terminal-muted uppercase tracking-wider">
          Perp Markets ({markets.length})
        </span>
        <div className="flex gap-2">
          {(
            [
              ["openInterestUsd", "OI"],
              ["dayNtlVlm", "Volume"],
              ["funding", "Funding"],
              ["priceChange24h", "Change"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-xs px-2 py-0.5 border transition ${
                sortBy === key
                  ? "border-terminal-green text-terminal-green"
                  : "border-terminal-border text-terminal-muted hover:text-terminal-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-terminal-border text-terminal-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2">Market</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">24h Chg</th>
              <th className="text-right px-4 py-2">Open Interest</th>
              <th className="text-right px-4 py-2">24h Volume</th>
              <th className="text-right px-4 py-2">Funding/hr</th>
              <th className="text-right px-4 py-2">Ann. Rate</th>
              <th className="text-right px-4 py-2">Leverage</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((m) => (
              <tr
                key={m.coin}
                className="border-b border-terminal-border hover:bg-terminal-surface transition-colors"
              >
                <td className="px-4 py-2 text-terminal-text font-semibold">
                  {m.coin}
                </td>
                <td className="px-4 py-2 text-right text-terminal-text">
                  {m.markPx < 1
                    ? `$${m.markPx.toPrecision(4)}`
                    : formatUSD(m.markPx)}
                </td>
                <td
                  className={`px-4 py-2 text-right ${
                    m.priceChange24h >= 0
                      ? "text-terminal-green"
                      : "text-terminal-red"
                  }`}
                >
                  {m.priceChange24h >= 0 ? "+" : ""}
                  {m.priceChange24h.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right text-terminal-text">
                  {formatUSD(m.openInterestUsd)}
                </td>
                <td className="px-4 py-2 text-right text-terminal-text">
                  {formatUSD(m.dayNtlVlm)}
                </td>
                <td
                  className={`px-4 py-2 text-right ${
                    m.funding >= 0
                      ? "text-terminal-green"
                      : "text-terminal-red"
                  }`}
                >
                  {(m.funding * 100).toFixed(4)}%
                </td>
                <td
                  className={`px-4 py-2 text-right ${
                    m.fundingAnnualized >= 0
                      ? "text-terminal-green"
                      : "text-terminal-red"
                  }`}
                >
                  {m.fundingAnnualized >= 0 ? "+" : ""}
                  {m.fundingAnnualized.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-right text-terminal-muted">
                  {m.maxLeverage}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && markets.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs text-terminal-muted hover:text-terminal-green border-t border-terminal-border transition"
        >
          Show all {markets.length} markets
        </button>
      )}
    </div>
  );
}
