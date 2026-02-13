import { loadEnv } from "../config/env.js";
import { Logger } from "../shared/logger.js";
import { enforceGeoBlock } from "../shared/geoblock.js";
import { L2OrderBook } from "../clob/orderbook.js";
import { PolymarketWsClient } from "../clob/wsClient.js";
import { searchMarkets, selectTokenId, writeMarketCache } from "../gamma/marketDiscovery.js";
import { readRuntimeConfig, defaultRuntimeConfig } from "../shared/runtimeConfig.js";
import { writeStateSnapshot } from "../shared/stateStore.js";
import { generateInventoryAwareQuote } from "../strategy/marketMaking.js";
import { canTrade } from "../risk/riskEngine.js";
import { SlidingWindowRateLimiter } from "../risk/rateLimiter.js";
import { buildExecutionClient } from "../execution/clobAdapter.js";
import { loadPaperPortfolio, savePaperPortfolio, applyPaperFill, updateMark } from "../storage/paperPortfolio.js";

const CLOB_REST_BASE = "https://clob.polymarket.com";

export async function runTrader(): Promise<void> {
  const env = loadEnv();
  const logger = new Logger("trader", env.LOG_LEVEL);
  await enforceGeoBlock(env.GEO_BLOCKED_COUNTRIES, logger);

  const [market] = await searchMarkets(env.MARKET_QUERY, 50);
  if (!market) throw new Error("No market found");
  writeMarketCache("./market-cache.json", market);
  const tokenId = selectTokenId(market, env.OUTCOME_SIDE);

  const execution = await buildExecutionClient({
    host: CLOB_REST_BASE,
    chainId: 137,
    privateKey: env.PRIVATE_KEY,
    apiKey: env.CLOB_API_KEY,
    apiSecret: env.CLOB_API_SECRET,
    apiPassphrase: env.CLOB_API_PASSPHRASE,
    dryRun: env.DRY_RUN
  });

  const book = new L2OrderBook();
  const paper = loadPaperPortfolio(env.PAPER_PORTFOLIO_PATH, env.PAPER_STARTING_CASH_USD);
  let reconnectCount = 0;
  let inventory = 0;
  let runtime = defaultRuntimeConfig;
  const limiter = new SlidingWindowRateLimiter(env.MAX_ORDERS_PER_MIN);

  setInterval(() => {
    try {
      const update = readRuntimeConfig(env.CONFIG_CHANNEL_PATH);
      if (update.version > runtime.version) runtime = update;
    } catch (error) {
      logger.warn("runtime config read failed", { error: String(error) });
    }
  }, 2_000);

  setInterval(() => {
    writeStateSnapshot(env.STATE_SNAPSHOT_PATH, {
      timestamp: new Date().toISOString(),
      market: market.slug,
      tokenId,
      paused: runtime.pauseTrading,
      conservativeMode: runtime.conservativeMode,
      reconnectCount,
      staleMarketData: Date.now() - book.lastUpdateTs > 5_000,
      lastMid: book.mid(),
      inventory: env.DRY_RUN ? paper.positionShares : inventory,
      realizedPnlUsd: paper.realizedPnlUsd,
      unrealizedPnlUsd: paper.unrealizedPnlUsd,
      drawdownUsd: Math.max(0, paper.startingCashUsd - paper.equityUsd),
      openOrders: [],
      metrics: { wsDisconnectRate: reconnectCount / 10, orderRejectRate: 0, avgSubmitLatencyMs: 0 }
    });
  }, 5_000);

  const ws = new PolymarketWsClient(logger, {
    onReconnect: (count) => { reconnectCount = count; },
    onMessage: async (msg: any) => {
      if (msg?.event_type !== "book") return;
      for (const b of msg.bids ?? []) book.applyUpdate("BUY", Number(b.price), Number(b.size));
      for (const a of msg.asks ?? []) book.applyUpdate("SELL", Number(a.price), Number(a.size));
      const mid = book.mid();
      if (!mid) return;
      const q = generateInventoryAwareQuote({
        mid,
        inventory: env.DRY_RUN ? paper.positionShares : inventory,
        edgeTicks: runtime.edgeTicks,
        tickSize: 0.001,
        orderSizeUsd: runtime.orderSizeUsd,
        conservativeMode: runtime.conservativeMode
      });
      updateMark(paper, mid);

      const risk = canTrade(env, runtime, {
        orderUsd: runtime.orderSizeUsd,
        projectedPositionUsd: (env.DRY_RUN ? paper.positionShares : inventory) * mid,
        drawdownUsd: Math.max(0, paper.startingCashUsd - paper.equityUsd),
        marketDataAgeMs: Date.now() - book.lastUpdateTs,
        reconnectCount
      });
      if (!risk.ok) {
        if (runtime.pauseTrading) await execution.cancelAll();
        return;
      }
      if (!limiter.allow()) return;
      logger.info("quote decision", { dryRun: env.DRY_RUN, bid: q.bidPrice, ask: q.askPrice });
      if (env.DRY_RUN) {
        applyPaperFill(paper, { side: "BUY", price: q.bidPrice, size: q.buySize }, mid);
        applyPaperFill(paper, { side: "SELL", price: q.askPrice, size: q.sellSize }, mid);
        savePaperPortfolio(env.PAPER_PORTFOLIO_PATH, paper);
      } else {
        await execution.placeOrder({ tokenId, side: "BUY", price: q.bidPrice, size: q.buySize });
        await execution.placeOrder({ tokenId, side: "SELL", price: q.askPrice, size: q.sellSize });
      }
    }
  });

  ws.connect({ type: "market", assets_ids: [tokenId] });
  logger.info("trader started", { market: market.slug, tokenId, dryRun: env.DRY_RUN, tradingEnabled: env.TRADING_ENABLED });
}
