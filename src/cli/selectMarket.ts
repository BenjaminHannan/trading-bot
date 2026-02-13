import { loadEnv } from "../config/env.js";
import { searchMarkets } from "../gamma/marketDiscovery.js";

const env = loadEnv();
const markets = await searchMarkets(env.MARKET_QUERY, 50);
for (const [i, m] of markets.slice(0, 10).entries()) {
  console.log(`#${i + 1} ${m.question} (${m.slug})`);
  console.log(`  tokens: ${m.tokens.map((t) => `${t.outcome}:${t.token_id}`).join(" | ")}`);
}
