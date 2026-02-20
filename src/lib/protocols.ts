import { ProtocolConfig } from "@/types";

export const PROTOCOLS: ProtocolConfig[] = [
  {
    slug: "hyperliquid",
    name: "Hyperliquid",
    category: "Perps",
    description:
      "Perpetual futures DEX on its own L1 with on-chain order book. High throughput, no gas fees for trading.",
    website: "https://hyperliquid.xyz",
    chains: ["Hyperliquid"],
  },
  {
    slug: "aave",
    name: "Aave",
    category: "Lending",
    description:
      "Largest decentralized lending protocol. Multi-chain with variable and stable rate borrowing.",
    website: "https://aave.com",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Avalanche", "Base"],
  },
  {
    slug: "morpho",
    name: "Morpho",
    category: "Lending",
    description:
      "Lending protocol optimizer and standalone lending markets. Improves capital efficiency for lenders and borrowers.",
    website: "https://morpho.org",
    chains: ["Ethereum", "Base"],
  },
  {
    slug: "uniswap",
    name: "Uniswap",
    category: "DEX",
    description:
      "Largest decentralized exchange by volume. AMM-based with concentrated liquidity (v3/v4) and intent-based routing (UniswapX).",
    website: "https://uniswap.org",
    chains: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base", "BNB Chain"],
  },
  {
    slug: "gmx",
    name: "GMX",
    category: "Perps",
    description:
      "Perpetual futures and spot DEX on Arbitrum and Avalanche. Uses multi-asset liquidity pool (GLP/GM).",
    website: "https://gmx.io",
    chains: ["Arbitrum", "Avalanche"],
  },
  {
    slug: "dydx",
    name: "dYdX",
    category: "Perps",
    description:
      "Perpetual futures exchange built on its own Cosmos appchain. Order book model with off-chain matching.",
    website: "https://dydx.exchange",
    chains: ["dYdX"],
  },
  {
    slug: "synthetix",
    name: "Synthetix",
    category: "Perps",
    description:
      "Derivatives liquidity protocol powering perps markets. Provides liquidity layer for front-ends like Kwenta.",
    website: "https://synthetix.io",
    chains: ["Ethereum", "Optimism", "Base"],
  },
];

export function getProtocolConfig(slug: string): ProtocolConfig | undefined {
  return PROTOCOLS.find((p) => p.slug === slug);
}
