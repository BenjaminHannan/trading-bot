import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  tokens: Array<{ token_id: string; outcome: string }>;
}

const BASE = "https://gamma-api.polymarket.com";

export async function searchMarkets(query: string, limit = 25): Promise<GammaMarket[]> {
  const url = new URL(`${BASE}/markets`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("active", "true");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gamma query failed: ${res.status}`);
  const data = (await res.json()) as GammaMarket[];
  const q = query.toLowerCase();
  return data.filter((m) => m.question.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
}

export function selectTokenId(market: GammaMarket, outcome: "YES" | "NO"): string {
  const token = market.tokens.find((t) => t.outcome.toUpperCase() === outcome);
  if (!token) throw new Error(`Outcome ${outcome} not found for market ${market.slug}`);
  return token.token_id;
}

export function loadMarketCache(path: string): GammaMarket | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as GammaMarket;
}

export function writeMarketCache(path: string, market: GammaMarket): void {
  writeFileSync(path, JSON.stringify(market, null, 2));
}
