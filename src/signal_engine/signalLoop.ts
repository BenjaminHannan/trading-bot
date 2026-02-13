import { loadEnv } from "../config/env.js";
import { Logger } from "../shared/logger.js";
import { appendSignal } from "../shared/messageBus.js";
import { Signal } from "../shared/schema.js";
import { buildMarketIndex } from "../gamma/marketIndex.js";
import { matchMarket } from "../gamma/matchMarket.js";
import { SportsWs } from "../feeds/sportsWs.js";
import { RtdsWs } from "../feeds/rtdsWs.js";
import { sportsWinProb } from "./models/sportsWinProb.js";
import { SignalDedupe } from "./dedupe.js";

export async function runSignalLoop(): Promise<void> {
  const env = loadEnv();
  const logger = new Logger("signal_engine", env.LOG_LEVEL);
  if (!env.SIGNAL_ENGINE_ENABLED) {
    logger.warn("signal engine disabled");
    return;
  }

  let index = await buildMarketIndex();
  setInterval(async () => {
    try { index = await buildMarketIndex(); logger.info("market index refreshed", { count: index.length }); }
    catch (e) { logger.warn("index refresh failed", { error: String(e) }); }
  }, env.MARKET_INDEX_REFRESH_SEC * 1000);

  const dedupe = new SignalDedupe();

  const emit = (eventId: string, source: Signal["source"], text: string, impliedProb: number, rationale: string): void => {
    const m = matchMarket(text, index);
    if (!m) return;
    const createdAtMs = Date.now();
    const key = `${source}:${eventId}:${m.entry.slug}:${Math.round(impliedProb * 1000)}`;
    if (!dedupe.shouldEmit(key, createdAtMs, env.SIGNAL_TTL_SEC * 1000)) return;
    const signal: Signal = {
      version: 1,
      createdAtMs,
      ttlSec: env.SIGNAL_TTL_SEC,
      source,
      eventId,
      marketSlug: m.entry.slug,
      tokenId: m.tokenId,
      impliedProb,
      confidence: Math.max(0.1, Math.min(0.95, m.score / 10)),
      rationale
    };
    appendSignal(env.SIGNAL_CHANNEL_PATH, signal);
    logger.info("signal emitted", { source, market: signal.marketSlug, prob: signal.impliedProb, conf: signal.confidence });
  };

  new SportsWs(logger, (e) => {
    const prob = sportsWinProb(e.home ?? 0, e.away ?? 0);
    emit(e.id, "sports_ws", e.text, prob, `sports update score ${e.home ?? 0}-${e.away ?? 0}`);
  }).start();

  new RtdsWs(logger, (e) => {
    emit(e.id, "rtds", e.text, 0.5, "rtds neutral baseline");
  }).start();
}
