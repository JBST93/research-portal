export interface ProtocolConfig {
  slug: string;
  name: string;
  category: "Perps" | "Lending" | "DEX";
  description: string;
  website: string;
  chains: string[];
}

export interface ProtocolData {
  slug: string;
  name: string;
  category: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  logo: string;
  fees24h: number | null;
  revenue24h: number | null;
  volume24h: number | null;
}

export interface ProtocolDetail {
  slug: string;
  name: string;
  category: string;
  description: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  logo: string;
  url: string;
  twitter: string | null;
  chainTvls: Record<string, number>;
  fees24h: number | null;
  fees7d: number | null;
  fees30d: number | null;
  revenue24h: number | null;
  revenue30d: number | null;
  volume24h: number | null;
  tvlHistory: { date: number; tvl: number }[];
}

export interface Alert {
  protocol: string;
  slug: string;
  type: "tvl_drop" | "tvl_surge" | "fee_spike" | "info";
  severity: "high" | "medium" | "low";
  message: string;
}

export type RiskLevel = 1 | 2 | 3 | 4;
