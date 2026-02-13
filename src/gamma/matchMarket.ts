import { MarketIndexEntry } from "./marketIndex.js";

export interface MatchResult { entry: MarketIndexEntry; score: number; tokenId: string }

export function matchMarket(eventText: string, index: MarketIndexEntry[]): MatchResult | null {
  const q = eventText.toLowerCase();
  let best: MatchResult | null = null;
  for (const entry of index) {
    let score = 0;
    const title = entry.title.toLowerCase();
    const slug = entry.slug.toLowerCase();
    if (title.includes(q) || q.includes(title)) score += 5;
    for (const word of q.split(/\s+/).filter(Boolean)) {
      if (title.includes(word)) score += 1;
      if (slug.includes(word)) score += 0.5;
      if (entry.tags.some((t) => t.toLowerCase().includes(word))) score += 0.75;
    }
    if (!best || score > best.score) {
      best = { entry, score, tokenId: entry.tokenIds[0] };
    }
  }
  return best && best.score > 1 ? best : null;
}
