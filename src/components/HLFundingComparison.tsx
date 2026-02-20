"use client";

import { useState } from "react";
import { HLFundingComparison } from "@/lib/hyperliquid";

interface Props {
  comparisons: HLFundingComparison[];
}

function annualize(rate: number, intervalHours: number): number {
  return rate * (24 / intervalHours) * 365 * 100;
}

function formatRate(rate: number | null, interval: number | null): string {
  if (rate === null || interval === null) return "—";
  return `${(rate * 100).toFixed(4)}%`;
}

function rateColor(rate: number | null): string {
  if (rate === null) return "text-terminal-dim";
  if (rate > 0) return "text-terminal-green";
  if (rate < 0) return "text-terminal-red";
  return "text-terminal-muted";
}

export default function HLFundingComparisonTable({ comparisons }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Only show coins that have at least HL + one other exchange
  const filtered = comparisons.filter(
    (c) => c.hyperliquid && (c.binance || c.bybit)
  );

  // Sort by absolute spread (HL vs Binance)
  const sorted = [...filtered].sort((a, b) => {
    const spreadA = Math.abs(
      (a.hyperliquid?.rate || 0) - (a.binance?.rate || a.bybit?.rate || 0)
    );
    const spreadB = Math.abs(
      (b.hyperliquid?.rate || 0) - (b.binance?.rate || b.bybit?.rate || 0)
    );
    return spreadB - spreadA;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 15);

  return (
    <div className="border border-terminal-border">
      <div className="px-4 py-3 border-b border-terminal-border">
        <span className="text-xs text-terminal-muted uppercase tracking-wider">
          Funding Rate Comparison — Hyperliquid vs CEX
        </span>
        <span className="text-xs text-terminal-dim ml-2">
          (sorted by spread)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-terminal-border text-terminal-muted text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2">Coin</th>
              <th className="text-right px-4 py-2">HL (1h)</th>
              <th className="text-right px-4 py-2">Binance (8h)</th>
              <th className="text-right px-4 py-2">Bybit (8h)</th>
              <th className="text-right px-4 py-2">HL Ann.</th>
              <th className="text-right px-4 py-2">Bin Ann.</th>
              <th className="text-right px-4 py-2">Spread Ann.</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((c) => {
              const hlAnn = c.hyperliquid
                ? annualize(c.hyperliquid.rate, c.hyperliquid.interval)
                : null;
              const binAnn = c.binance
                ? annualize(c.binance.rate, c.binance.interval)
                : null;
              const spread =
                hlAnn !== null && binAnn !== null ? hlAnn - binAnn : null;

              return (
                <tr
                  key={c.coin}
                  className="border-b border-terminal-border hover:bg-terminal-surface transition-colors"
                >
                  <td className="px-4 py-2 text-terminal-text font-semibold">
                    {c.coin}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${rateColor(c.hyperliquid?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.hyperliquid?.rate ?? null,
                      c.hyperliquid?.interval ?? null
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${rateColor(c.binance?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.binance?.rate ?? null,
                      c.binance?.interval ?? null
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${rateColor(c.bybit?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.bybit?.rate ?? null,
                      c.bybit?.interval ?? null
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${rateColor(hlAnn)}`}
                  >
                    {hlAnn !== null ? `${hlAnn >= 0 ? "+" : ""}${hlAnn.toFixed(1)}%` : "—"}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${rateColor(binAnn)}`}
                  >
                    {binAnn !== null ? `${binAnn >= 0 ? "+" : ""}${binAnn.toFixed(1)}%` : "—"}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      spread !== null
                        ? Math.abs(spread) > 20
                          ? "text-terminal-amber"
                          : "text-terminal-muted"
                        : "text-terminal-dim"
                    }`}
                  >
                    {spread !== null
                      ? `${spread >= 0 ? "+" : ""}${spread.toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!showAll && sorted.length > 15 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-xs text-terminal-muted hover:text-terminal-green border-t border-terminal-border transition"
        >
          Show all {sorted.length} pairs
        </button>
      )}
    </div>
  );
}
