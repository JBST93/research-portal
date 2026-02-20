"use client";

import { useState } from "react";
import { DexVolume } from "@/types";
import { formatUSD, formatPercent, formatPercentColor } from "@/lib/format";

interface DexTableProps {
  dexes: DexVolume[];
}

type SortKey = "volume24h" | "volume7d" | "volume30d" | "change_1d" | "dominance";

export default function DexTable({ dexes }: DexTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("volume24h");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...dexes].sort((a, b) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    if (sortBy === "change_1d") return Math.abs(bVal) - Math.abs(aVal);
    return bVal - aVal;
  });

  return (
    <div className="bg-bb-panel border border-bb-border">
      <div className="bb-header flex items-center justify-between">
        <span>DEX Rankings by Volume</span>
        <div className="flex gap-1">
          {(
            [
              ["volume24h", "24h"],
              ["volume7d", "7d"],
              ["volume30d", "30d"],
              ["dominance", "Dom%"],
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
              <th className="text-left px-3 py-1.5 w-8">#</th>
              <th className="text-left px-3 py-1.5">DEX</th>
              <th className="text-right px-3 py-1.5">24h Volume</th>
              <th className="text-right px-3 py-1.5">7d Volume</th>
              <th className="text-right px-3 py-1.5">30d Volume</th>
              <th className="text-right px-3 py-1.5">24h Chg</th>
              <th className="text-right px-3 py-1.5">7d Chg</th>
              <th className="text-right px-3 py-1.5">Dom%</th>
              <th className="text-left px-3 py-1.5">Chains</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <>
                <tr
                  key={d.slug}
                  className="bb-row cursor-pointer"
                  onClick={() =>
                    setExpanded(expanded === d.slug ? null : d.slug)
                  }
                >
                  <td className="px-3 py-1.5 text-bb-dim">{i + 1}</td>
                  <td className="px-3 py-1.5 text-bb-white font-semibold">
                    {d.name}
                    {expanded === d.slug ? (
                      <span className="text-bb-dim ml-1">-</span>
                    ) : Object.keys(d.chainBreakdown).length > 1 ? (
                      <span className="text-bb-dim ml-1">+</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-1.5 text-right text-bb-white">
                    {formatUSD(d.volume24h)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-bb-text">
                    {formatUSD(d.volume7d)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-bb-text">
                    {formatUSD(d.volume30d)}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right ${formatPercentColor(d.change_1d)}`}
                  >
                    {formatPercent(d.change_1d)}
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right ${formatPercentColor(d.change_7d)}`}
                  >
                    {formatPercent(d.change_7d)}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-1 bg-bb-dim overflow-hidden">
                        <div
                          className="h-full bg-bb-orange"
                          style={{ width: `${Math.min(d.dominance, 100)}%` }}
                        />
                      </div>
                      <span className="text-bb-muted text-xxs w-10 text-right">
                        {d.dominance.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-bb-muted text-xxs">
                    {d.chains.slice(0, 3).join(", ")}
                    {d.chains.length > 3 && ` +${d.chains.length - 3}`}
                  </td>
                </tr>
                {/* Expanded chain breakdown */}
                {expanded === d.slug &&
                  Object.keys(d.chainBreakdown).length > 0 && (
                    <tr key={`${d.slug}-breakdown`}>
                      <td colSpan={9} className="bg-bb-surface px-3 py-2">
                        <div className="text-xxs text-bb-orange uppercase tracking-wider mb-1.5">
                          Chain Breakdown — 24h
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
                          {Object.entries(d.chainBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([chain, vol]) => {
                              const pct =
                                d.volume24h > 0
                                  ? (vol / d.volume24h) * 100
                                  : 0;
                              return (
                                <div
                                  key={chain}
                                  className="flex items-center justify-between font-mono"
                                >
                                  <span className="text-bb-text text-xs">
                                    {chain}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-bb-white text-xs">
                                      {formatUSD(vol)}
                                    </span>
                                    <span className="text-bb-dim text-xxs w-10 text-right">
                                      {pct.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
