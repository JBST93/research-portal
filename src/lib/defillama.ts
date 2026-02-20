import { ProtocolData, ProtocolDetail } from "@/types";
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
