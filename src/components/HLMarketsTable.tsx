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
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>Perp Markets ({markets.length})</span>
        <div className="flex gap-1">
          {(
            [
              ["openInterestUsd", "OI"],
              ["dayNtlVlm", "Vol"],
              ["funding", "Fund"],
              ["priceChange24h", "Chg"],
            ] as [SortKey, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-xxs px-1.5 py-0.5 transition ${
                sortBy === key
                  ? "text-bb-orange bg-bb-surface"
                  : "text-bb-muted hover:text-bb-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-bb-border text-bb-muted text-xxs uppercase tracking-wider">
              <th className="text-left px-3 py-1.5">Market</th>
              <th className="text-right px-3 py-1.5">Price</th>
              <th className="text-right px-3 py-1.5">24h</th>
              <th className="text-right px-3 py-1.5">OI</th>
              <th className="text-right px-3 py-1.5">Volume</th>
              <th className="text-right px-3 py-1.5">Fund/hr</th>
              <th className="text-right px-3 py-1.5">Ann.</th>
              <th className="text-right px-3 py-1.5">Lev</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((m) => (
              <tr key={m.coin} className="bb-row">
                <td className="px-3 py-1 text-bb-white font-semibold">
                  {m.coin}
                </td>
                <td className="px-3 py-1 text-right text-bb-text">
                  {m.markPx < 1
                    ? `$${m.markPx.toPrecision(4)}`
                    : formatUSD(m.markPx)}
                </td>
                <td
                  className={`px-3 py-1 text-right ${
                    m.priceChange24h >= 0 ? "text-bb-green" : "text-bb-red"
                  }`}
                >
                  {m.priceChange24h >= 0 ? "+" : ""}
                  {m.priceChange24h.toFixed(2)}%
                </td>
                <td className="px-3 py-1 text-right text-bb-text">
                  {formatUSD(m.openInterestUsd)}
                </td>
                <td className="px-3 py-1 text-right text-bb-text">
                  {formatUSD(m.dayNtlVlm)}
                </td>
                <td
                  className={`px-3 py-1 text-right ${
                    m.funding >= 0 ? "text-bb-green" : "text-bb-red"
                  }`}
                >
                  {(m.funding * 100).toFixed(4)}%
                </td>
                <td
                  className={`px-3 py-1 text-right ${
                    m.fundingAnnualized >= 0 ? "text-bb-green" : "text-bb-red"
                  }`}
                >
                  {m.fundingAnnualized >= 0 ? "+" : ""}
                  {m.fundingAnnualized.toFixed(1)}%
                </td>
                <td className="px-3 py-1 text-right text-bb-dim">
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
          className="w-full py-1.5 text-xxs text-bb-muted hover:text-bb-orange border-t border-bb-border transition uppercase tracking-wider"
        >
          Show all {markets.length} markets
        </button>
      )}
    </div>
  );
}
