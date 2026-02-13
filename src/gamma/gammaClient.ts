import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface GammaToken { token_id: string; outcome: string }
export interface GammaMarket { id: string; slug: string; question: string; tags?: string[]; startDate?: string; tokens: GammaToken[] }

const BASE = "https://gamma-api.polymarket.com";

export async function fetchMarketsPage(limit = 200, offset = 0): Promise<GammaMarket[]> {
  const u = new URL(`${BASE}/markets`);
  u.searchParams.set("active", "true");
  u.searchParams.set("limit", String(limit));
  u.searchParams.set("offset", String(offset));
  const res = await fetch(u);
  if (!res.ok) throw new Error(`gamma ${res.status}`);
  return (await res.json()) as GammaMarket[];
}

export async function fetchAllMarkets(maxPages = 3): Promise<GammaMarket[]> {
  const out: GammaMarket[] = [];
  for (let i = 0; i < maxPages; i += 1) {
    const page = await fetchMarketsPage(200, i * 200);
    out.push(...page);
    if (page.length < 200) break;
  }
  return out;
}

export function readCache<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeCache<T>(path: string, value: T): void { writeFileSync(path, JSON.stringify(value, null, 2)); }
