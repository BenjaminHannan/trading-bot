import { fetchAllMarkets, GammaMarket } from "./gammaClient.js";

export interface MarketIndexEntry {
  slug: string;
  title: string;
  tags: string[];
  startsAt?: string;
  tokenIds: string[];
  raw: GammaMarket;
}

export async function buildMarketIndex(): Promise<MarketIndexEntry[]> {
  const markets = await fetchAllMarkets();
  return markets
    .filter((m) => Array.isArray(m.tokens) && m.tokens.length > 0)
    .map((m) => ({
      slug: m.slug,
      title: m.question,
      tags: m.tags ?? [],
      startsAt: m.startDate,
      tokenIds: m.tokens.map((t) => t.token_id),
      raw: m
    }));
}
