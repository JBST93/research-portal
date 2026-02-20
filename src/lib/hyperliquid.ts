const HL_API = "https://api.hyperliquid.xyz/info";

async function postHL(body: Record<string, unknown>) {
  const res = await fetch(HL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export interface HLMarket {
  coin: string;
  markPx: number;
  oraclePx: number;
  openInterest: number;
  openInterestUsd: number;
  funding: number;
  fundingAnnualized: number;
  premium: number;
  dayNtlVlm: number;
  dayBaseVlm: number;
  prevDayPx: number;
  priceChange24h: number;
  maxLeverage: number;
}

export interface HLFundingComparison {
  coin: string;
  hyperliquid: { rate: number; interval: number } | null;
  binance: { rate: number; interval: number } | null;
  bybit: { rate: number; interval: number } | null;
}

export interface HLVault {
  name: string;
  aum: number;
  pnlDay: number;
  pnlWeek: number;
  pnlAllTime: number;
}

export interface HLOverview {
  markets: HLMarket[];
  totalOI: number;
  totalVolume24h: number;
  marketCount: number;
}

export async function getHLOverview(): Promise<HLOverview | null> {
  const data = await postHL({ type: "metaAndAssetCtxs" });
  if (!data || !Array.isArray(data) || data.length < 2) return null;

  const [meta, contexts] = data;
  const universe = meta.universe;

  const markets: HLMarket[] = [];
  let totalOI = 0;
  let totalVolume = 0;

  for (let i = 0; i < universe.length; i++) {
    const asset = universe[i];
    const ctx = contexts[i];
    if (!ctx || asset.isDelisted) continue;

    const markPx = parseFloat(ctx.markPx);
    const oi = parseFloat(ctx.openInterest);
    const oiUsd = oi * markPx;
    const funding = parseFloat(ctx.funding);
    const dayNtlVlm = parseFloat(ctx.dayNtlVlm);
    const prevDayPx = parseFloat(ctx.prevDayPx);
    const priceChange = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;

    totalOI += oiUsd;
    totalVolume += dayNtlVlm;

    markets.push({
      coin: asset.name,
      markPx,
      oraclePx: parseFloat(ctx.oraclePx),
      openInterest: oi,
      openInterestUsd: oiUsd,
      funding,
      fundingAnnualized: funding * 24 * 365 * 100,
      premium: parseFloat(ctx.premium),
      dayNtlVlm,
      dayBaseVlm: parseFloat(ctx.dayBaseVlm || "0"),
      prevDayPx,
      priceChange24h: priceChange,
      maxLeverage: asset.maxLeverage,
    });
  }

  // Sort by OI descending
  markets.sort((a, b) => b.openInterestUsd - a.openInterestUsd);

  return {
    markets,
    totalOI,
    totalVolume24h: totalVolume,
    marketCount: markets.length,
  };
}

export async function getFundingComparisons(): Promise<HLFundingComparison[]> {
  const data = await postHL({ type: "predictedFundings" });
  if (!data || !Array.isArray(data)) return [];

  const comparisons: HLFundingComparison[] = [];

  for (const [coin, exchanges] of data) {
    if (!Array.isArray(exchanges)) continue;

    const comp: HLFundingComparison = {
      coin,
      hyperliquid: null,
      binance: null,
      bybit: null,
    };

    for (const [exchange, info] of exchanges) {
      if (!info || info.fundingRate === undefined || info.fundingRate === null) continue;

      const entry = {
        rate: parseFloat(info.fundingRate),
        interval: info.fundingIntervalHours,
      };

      if (exchange === "HlPerp") comp.hyperliquid = entry;
      else if (exchange === "BinPerp") comp.binance = entry;
      else if (exchange === "BybitPerp") comp.bybit = entry;
    }

    comparisons.push(comp);
  }

  return comparisons;
}

export async function getHLPVault(): Promise<HLVault | null> {
  const data = await postHL({
    type: "vaultDetails",
    vaultAddress: "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303",
  });

  if (!data) return null;

  let aum = 0;
  let pnlDay = 0;
  let pnlWeek = 0;
  let pnlAllTime = 0;

  if (data.portfolio) {
    for (const [period, periodData] of data.portfolio) {
      const history = periodData?.accountValueHistory;
      const pnlHistory = periodData?.pnlHistory;

      if (history && history.length > 0) {
        const latest = parseFloat(history[history.length - 1][1]);
        if (period === "day") aum = latest;
      }

      if (pnlHistory && pnlHistory.length > 0) {
        const totalPnl = pnlHistory.reduce(
          (sum: number, entry: [number, string]) => sum + parseFloat(entry[1]),
          0
        );
        if (period === "day") pnlDay = totalPnl;
        else if (period === "week") pnlWeek = totalPnl;
        else if (period === "allTime") pnlAllTime = totalPnl;
      }
    }
  }

  return {
    name: data.name || "Hyperliquidity Provider (HLP)",
    aum,
    pnlDay,
    pnlWeek,
    pnlAllTime,
  };
}
