import { loadEnv } from "../config/env.js";
import { Logger } from "../shared/logger.js";
import { enforceGeoBlock } from "../shared/geoblock.js";
import { RuntimeConfig, Signal } from "../shared/schema.js";
import { readRuntimeConfig, readSignalsSince } from "../shared/messageBus.js";
import { isExpired } from "../shared/time.js";
import { buildSignalOrders } from "../strategy/signalDrivenStrategy.js";
import { riskCheck } from "../risk/riskEngine.js";
import { Executor } from "../execution/executor.js";
import { writeSnapshot } from "../storage/snapshots.js";
import { ClobMarketWs } from "../clob/clobWs.js";
import { initMetrics } from "./metrics.js";

const CLOB_REST = "https://clob.polymarket.com";

export async function runTrader(): Promise<void> {
  const env = loadEnv();
  const logger = new Logger("trader", env.LOG_LEVEL);
  await enforceGeoBlock(env.GEO_BLOCKED_COUNTRIES, logger);

  const runtimeDefault: RuntimeConfig = {
    version: 1,
    updatedAtMs: Date.now(),
    paused: false,
    edgeThresholdBps: env.EDGE_THRESHOLD_BPS,
    signalTtlSec: env.SIGNAL_TTL_SEC,
    maxOrderUsd: env.MAX_ORDER_USD,
    maxOrdersPerMin: env.MAX_ORDERS_PER_MIN
  };

  const exec = new Executor(logger, {
    dryRun: env.DRY_RUN,
    host: CLOB_REST,
    chainId: 137,
    privateKey: env.PRIVATE_KEY,
    apiKey: env.CLOB_API_KEY,
    apiSecret: env.CLOB_API_SECRET,
    apiPassphrase: env.CLOB_API_PASSPHRASE
  });
  await exec.init();

  let runtime = readRuntimeConfig(env.RUNTIME_CONFIG_PATH, runtimeDefault);
  let signalOffset = 0;
  let currentSignal: Signal | null = null;
  let bestBid = 0;
  let bestAsk = 0;
  let lastBookTs = 0;
  let reconnectCount = 0;
  let positionUsd = 0;
  let drawdownUsd = 0;
  let ordersTs: number[] = [];
  const metrics = initMetrics();

  setInterval(() => {
    runtime = readRuntimeConfig(env.RUNTIME_CONFIG_PATH, runtimeDefault);
  }, 2000);

  setInterval(() => {
    const read = readSignalsSince(env.SIGNAL_CHANNEL_PATH, signalOffset);
    signalOffset = read.nextOffset;
    for (const s of read.signals) {
      metrics.signalsSeen += 1;
      metrics.lastSignalAtMs = s.createdAtMs;
      currentSignal = s;
    }
  }, 200);

  setInterval(() => {
    writeSnapshot(env.STATE_SNAPSHOT_PATH, {
      ts: new Date().toISOString(),
      mode: env.DRY_RUN ? "DRY_RUN" : "LIVE",
      paused: runtime.paused,
      marketSlug: currentSignal?.marketSlug,
      tokenId: currentSignal?.tokenId,
      lastMid: bestBid && bestAsk ? (bestBid + bestAsk) / 2 : undefined,
      openOrders: 0,
      ordersPlaced: metrics.ordersPlaced,
      signalsSeen: metrics.signalsSeen,
      lastSignalAtMs: metrics.lastSignalAtMs,
      drawdownUsd
    });
  }, 5000);

  const evaluate = async (): Promise<void> => {
    if (!currentSignal) return;
    const signal = currentSignal;
    if (isExpired(signal.createdAtMs, Math.min(signal.ttlSec, runtime.signalTtlSec))) return;
    if (!(bestBid > 0 && bestAsk > 0)) return;

    const mid = (bestBid + bestAsk) / 2;
    const plans = buildSignalOrders({
      signal,
      mid,
      bestBid,
      bestAsk,
      edgeThresholdBps: runtime.edgeThresholdBps,
      maxOrderUsd: runtime.maxOrderUsd
    });

    for (const p of plans) {
      ordersTs = ordersTs.filter((ts) => ts > Date.now() - 60_000);
      const orderUsd = p.price * p.size;
      const risk = riskCheck(env, {
        positionUsd,
        drawdownUsd,
        staleMarketDataMs: Date.now() - lastBookTs,
        reconnectCount,
        ordersLastMinute: ordersTs.length,
        paused: runtime.paused
      }, orderUsd);

      if (!risk.ok) {
        if (risk.reason === "kill_switch") await exec.cancelAll();
        logger.warn("risk_block", { reason: risk.reason });
        return;
      }

      await exec.submit({ tokenId: signal.tokenId, side: p.side, price: p.price, size: p.size });
      metrics.ordersPlaced += 1;
      ordersTs.push(Date.now());
      positionUsd += p.side === "BUY" ? orderUsd : -orderUsd;
    }
  };

  let ws: ClobMarketWs | null = null;
  setInterval(() => {
    if (!currentSignal?.tokenId) return;
    if (!ws) {
      ws = new ClobMarketWs(logger, currentSignal.tokenId, (top) => {
        bestBid = top.bid; bestAsk = top.ask; lastBookTs = top.ts;
        evaluate().catch((e) => logger.error("evaluate error", { error: String(e) }));
      });
      ws.start();
      reconnectCount += 1;
    }
  }, 300);

  logger.info("trader_started", { dryRun: env.DRY_RUN, tradingEnabled: env.TRADING_ENABLED });
}
