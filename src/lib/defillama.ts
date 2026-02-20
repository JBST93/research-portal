import { ProtocolData, ProtocolDetail, DexVolume } from "@/types";
import { PROTOCOLS } from "./protocols";

const BASE_URL = "https://api.llama.fi";

// Simple in-memory cache to avoid Next.js 2MB cache limit on large responses
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchJSON(url: string) {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && cached.expiry > now) return cached.data;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  cache.set(url, { data, expiry: now + CACHE_TTL });
  return data;
}

interface DefiLlamaProtocol {
  slug: string;
  name: string;
  category: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  logo: string;
}

export async function getAllProtocolData(): Promise<ProtocolData[]> {
  const slugs = new Set(PROTOCOLS.map((p) => p.slug));

  const [allProtocols, feesOverview] = await Promise.all([
    fetchJSON(`${BASE_URL}/protocols`),
    fetchJSON(
      `${BASE_URL}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
    ),
  ]);

  if (!allProtocols) return [];

  const protocolMap = new Map<string, DefiLlamaProtocol>();
  for (const p of allProtocols) {
    if (slugs.has(p.slug)) {
      protocolMap.set(p.slug, p);
    }
    // Also check for parent protocols (e.g. "parent#aave")
    if (p.parentProtocol) {
      const parentSlug = p.parentProtocol.replace("parent#", "");
      if (slugs.has(parentSlug) && !protocolMap.has(parentSlug)) {
        protocolMap.set(parentSlug, { ...p, slug: parentSlug });
      }
    }
  }

  // Build fees lookup
  const feesMap = new Map<string, { fees24h: number; revenue24h: number }>();
  if (feesOverview?.protocols) {
    for (const p of feesOverview.protocols) {
      const slug = p.slug || p.name?.toLowerCase().replace(/\s+/g, "-");
      if (slugs.has(slug)) {
        feesMap.set(slug, {
          fees24h: p.total24h || 0,
          revenue24h: p.totalRevenue24h || 0,
        });
      }
      if (p.parentProtocol) {
        const parentSlug = p.parentProtocol.replace("parent#", "");
        if (slugs.has(parentSlug)) {
          const existing = feesMap.get(parentSlug);
          feesMap.set(parentSlug, {
            fees24h: (existing?.fees24h || 0) + (p.total24h || 0),
            revenue24h: (existing?.revenue24h || 0) + (p.totalRevenue24h || 0),
          });
        }
      }
    }
  }

  return PROTOCOLS.map((config) => {
    const data = protocolMap.get(config.slug);
    const fees = feesMap.get(config.slug);

    return {
      slug: config.slug,
      name: config.name,
      category: config.category,
      tvl: data?.tvl || 0,
      change_1d: data?.change_1d ?? null,
      change_7d: data?.change_7d ?? null,
      chains: data?.chains || config.chains,
      logo: data?.logo || "",
      fees24h: fees?.fees24h ?? null,
      revenue24h: fees?.revenue24h ?? null,
      volume24h: null,
    };
  });
}

export async function getTopProtocols(limit: number = 100): Promise<ProtocolData[]> {
  const [allProtocols, feesOverview] = await Promise.all([
    fetchJSON(`${BASE_URL}/protocols`),
    fetchJSON(
      `${BASE_URL}/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
    ),
  ]);

  if (!allProtocols) return [];

  // Build fees lookup by slug
  const feesMap = new Map<string, { fees24h: number; revenue24h: number }>();
  if (feesOverview?.protocols) {
    for (const p of feesOverview.protocols) {
      const slug = p.slug || p.name?.toLowerCase().replace(/\s+/g, "-");
      if (slug) {
        const existing = feesMap.get(slug);
        feesMap.set(slug, {
          fees24h: (existing?.fees24h || 0) + (p.total24h || 0),
          revenue24h: (existing?.revenue24h || 0) + (p.totalRevenue24h || 0),
        });
      }
    }
  }

  // Filter to non-child protocols, sort by TVL, take top N
  const top = allProtocols
    .filter((p: DefiLlamaProtocol & { parentProtocol?: string }) =>
      !p.parentProtocol && p.tvl > 0 && p.slug
    )
    .sort((a: DefiLlamaProtocol, b: DefiLlamaProtocol) => b.tvl - a.tvl)
    .slice(0, limit);

  return top.map((p: DefiLlamaProtocol & { category?: string }) => {
    const fees = feesMap.get(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      category: p.category || "",
      tvl: p.tvl,
      change_1d: p.change_1d ?? null,
      change_7d: p.change_7d ?? null,
      chains: p.chains || [],
      logo: p.logo || "",
      fees24h: fees?.fees24h ?? null,
      revenue24h: fees?.revenue24h ?? null,
      volume24h: null,
    };
  });
}

export async function getDexVolumes(limit: number = 100): Promise<{
  dexes: DexVolume[];
  totalVolume24h: number;
  totalVolume7d: number;
}> {
  const data = await fetchJSON(
    `${BASE_URL}/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`
  );

  if (!data?.protocols) return { dexes: [], totalVolume24h: 0, totalVolume7d: 0 };

  // Filter to parent protocols only, sort by 24h volume
  const parentMap = new Map<string, DexVolume>();

  for (const p of data.protocols) {
    const slug = p.slug || p.defillamaId || p.name?.toLowerCase().replace(/\s+/g, "-");
    if (!slug || !p.total24h) continue;

    // Aggregate child protocols under parents
    const parentSlug = p.parentProtocol
      ? p.parentProtocol.replace("parent#", "")
      : slug;

    const existing = parentMap.get(parentSlug);

    // Build chain breakdown from breakdown24h
    const chainBreakdown: Record<string, number> = {};
    if (p.breakdown24h) {
      for (const [chain, protocols] of Object.entries(p.breakdown24h)) {
        const chainTotal = Object.values(protocols as Record<string, number>).reduce(
          (sum: number, v) => sum + (typeof v === "number" ? v : 0),
          0
        );
        chainBreakdown[chain] = (existing?.chainBreakdown?.[chain] || 0) + chainTotal;
      }
    }

    if (existing) {
      existing.volume24h += p.total24h || 0;
      existing.volume7d += p.total7d || 0;
      existing.volume30d += p.total30d || 0;
      existing.chains = Array.from(new Set([...existing.chains, ...(p.chains || [])]));
      existing.chainBreakdown = { ...existing.chainBreakdown, ...chainBreakdown };
    } else {
      parentMap.set(parentSlug, {
        name: p.parentProtocol
          ? parentSlug.charAt(0).toUpperCase() + parentSlug.slice(1)
          : p.name || slug,
        slug: parentSlug,
        logo: p.logo || "",
        chains: p.chains || [],
        volume24h: p.total24h || 0,
        volume7d: p.total7d || 0,
        volume30d: p.total30d || 0,
        change_1d: p.parentProtocol ? null : p.change_1d ?? null,
        change_7d: p.parentProtocol ? null : p.change_7d ?? null,
        change_1m: p.parentProtocol ? null : p.change_1m ?? null,
        dominance: 0,
        chainBreakdown,
      });
    }
  }

  const dexes = Array.from(parentMap.values())
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit);

  const totalVolume24h = dexes.reduce((sum, d) => sum + d.volume24h, 0);
  const totalVolume7d = dexes.reduce((sum, d) => sum + d.volume7d, 0);

  // Calculate dominance
  for (const d of dexes) {
    d.dominance = totalVolume24h > 0 ? (d.volume24h / totalVolume24h) * 100 : 0;
  }

  return { dexes, totalVolume24h, totalVolume7d };
}

export async function getProtocolDetail(
  slug: string
): Promise<ProtocolDetail | null> {
  const [protocolData, feesData, revenueData] = await Promise.all([
    fetchJSON(`${BASE_URL}/protocol/${slug}`),
    fetchJSON(`${BASE_URL}/summary/fees/${slug}?dataType=dailyFees`),
    fetchJSON(`${BASE_URL}/summary/fees/${slug}?dataType=dailyRevenue`),
  ]);

  if (!protocolData) return null;

  // Extract chain TVLs
  const chainTvls: Record<string, number> = {};
  if (protocolData.currentChainTvls) {
    for (const [chain, tvl] of Object.entries(protocolData.currentChainTvls)) {
      // Skip entries like "Ethereum-staking", "Ethereum-borrowed"
      if (!chain.includes("-")) {
        chainTvls[chain] = tvl as number;
      }
    }
  }

  // Extract last 90 days of TVL history
  const tvlHistory: { date: number; tvl: number }[] = [];
  if (protocolData.tvl && Array.isArray(protocolData.tvl)) {
    const last90 = protocolData.tvl.slice(-90);
    for (const point of last90) {
      tvlHistory.push({
        date: point.date,
        tvl: point.totalLiquidityUSD,
      });
    }
  }

  return {
    slug,
    name: protocolData.name || slug,
    category: protocolData.category || "",
    description: protocolData.description || "",
    tvl: protocolData.tvl?.[protocolData.tvl.length - 1]?.totalLiquidityUSD || 0,
    change_1d: protocolData.change_1d ?? null,
    change_7d: protocolData.change_7d ?? null,
    chains: protocolData.chains || [],
    logo: protocolData.logo || "",
    url: protocolData.url || "",
    twitter: protocolData.twitter || null,
    chainTvls,
    fees24h: feesData?.total24h ?? null,
    fees7d: feesData?.total7d ?? null,
    fees30d: feesData?.total30d ?? null,
    revenue24h: revenueData?.total24h ?? null,
    revenue30d: revenueData?.total30d ?? null,
    volume24h: null,
    tvlHistory,
  };
}
