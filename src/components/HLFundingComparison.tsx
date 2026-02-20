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
  if (rate === null) return "text-bb-dim";
  if (rate > 0) return "text-bb-green";
  if (rate < 0) return "text-bb-red";
  return "text-bb-muted";
}

export default function HLFundingComparisonTable({ comparisons }: Props) {
  const [showAll, setShowAll] = useState(false);

  const filtered = comparisons.filter(
    (c) => c.hyperliquid && (c.binance || c.bybit)
  );

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
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>Funding Comparison — HL vs CEX</span>
        <span className="text-bb-muted normal-case tracking-normal font-normal text-xxs">
          Sorted by spread
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-bb-border text-bb-muted text-xxs uppercase tracking-wider">
              <th className="text-left px-3 py-1.5">Coin</th>
              <th className="text-right px-3 py-1.5">HL 1h</th>
              <th className="text-right px-3 py-1.5">Bin 8h</th>
              <th className="text-right px-3 py-1.5">Byb 8h</th>
              <th className="text-right px-3 py-1.5">HL Ann</th>
              <th className="text-right px-3 py-1.5">Bin Ann</th>
              <th className="text-right px-3 py-1.5">Spread</th>
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
                <tr key={c.coin} className="bb-row">
                  <td className="px-3 py-1 text-bb-white font-semibold">
                    {c.coin}
                  </td>
                  <td
                    className={`px-3 py-1 text-right ${rateColor(c.hyperliquid?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.hyperliquid?.rate ?? null,
                      c.hyperliquid?.interval ?? null
                    )}
                  </td>
                  <td
                    className={`px-3 py-1 text-right ${rateColor(c.binance?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.binance?.rate ?? null,
                      c.binance?.interval ?? null
                    )}
                  </td>
                  <td
                    className={`px-3 py-1 text-right ${rateColor(c.bybit?.rate ?? null)}`}
                  >
                    {formatRate(
                      c.bybit?.rate ?? null,
                      c.bybit?.interval ?? null
                    )}
                  </td>
                  <td className={`px-3 py-1 text-right ${rateColor(hlAnn)}`}>
                    {hlAnn !== null
                      ? `${hlAnn >= 0 ? "+" : ""}${hlAnn.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className={`px-3 py-1 text-right ${rateColor(binAnn)}`}>
                    {binAnn !== null
                      ? `${binAnn >= 0 ? "+" : ""}${binAnn.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td
                    className={`px-3 py-1 text-right font-semibold ${
                      spread !== null
                        ? Math.abs(spread) > 20
                          ? "text-bb-amber"
                          : "text-bb-muted"
                        : "text-bb-dim"
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
          className="w-full py-1.5 text-xxs text-bb-muted hover:text-bb-orange border-t border-bb-border transition uppercase tracking-wider"
        >
          Show all {sorted.length} pairs
        </button>
      )}
    </div>
  );
}
