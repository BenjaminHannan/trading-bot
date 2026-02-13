export type SignalSource = "sports_ws" | "rtds" | "manual";

export interface Signal {
  version: 1;
  createdAtMs: number;
  ttlSec: number;
  source: SignalSource;
  eventId: string;
  marketSlug: string;
  tokenId: string;
  impliedProb: number;
  confidence: number;
  rationale: string;
}

export interface RuntimeConfig {
  version: number;
  updatedAtMs: number;
  paused: boolean;
  edgeThresholdBps: number;
  signalTtlSec: number;
  maxOrderUsd: number;
  maxOrdersPerMin: number;
}

export interface StateSnapshot {
  ts: string;
  mode: "DRY_RUN" | "LIVE";
  paused: boolean;
  marketSlug?: string;
  tokenId?: string;
  lastMid?: number;
  openOrders: number;
  ordersPlaced: number;
  signalsSeen: number;
  lastSignalAtMs?: number;
  drawdownUsd: number;
  notes?: string[];
}

export interface EnvConfig {
  PRIVATE_KEY?: string;
  CLOB_API_KEY?: string;
  CLOB_API_SECRET?: string;
  CLOB_API_PASSPHRASE?: string;
  RPC_URL?: string;
  DRY_RUN: boolean;
  TRADING_ENABLED: boolean;
  SIGNAL_ENGINE_ENABLED: boolean;
  MARKET_INDEX_REFRESH_SEC: number;
  SIGNAL_CHANNEL_PATH: string;
  RUNTIME_CONFIG_PATH: string;
  STATE_SNAPSHOT_PATH: string;
  MAX_POSITION_USD: number;
  MAX_ORDER_USD: number;
  MAX_ORDERS_PER_MIN: number;
  KILL_SWITCH_DRAWDOWN_USD: number;
  EDGE_THRESHOLD_BPS: number;
  SIGNAL_TTL_SEC: number;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  GEO_BLOCKED_COUNTRIES: string[];
  COUNTRY_CODE: string;
}

export function parseSignal(v: unknown): Signal {
  const s = v as Signal;
  if (s?.version !== 1) throw new Error("signal.version must be 1");
  if (!Number.isFinite(s.createdAtMs)) throw new Error("signal.createdAtMs invalid");
  if (!Number.isFinite(s.ttlSec) || s.ttlSec <= 0) throw new Error("signal.ttlSec invalid");
  if (!["sports_ws", "rtds", "manual"].includes(s.source)) throw new Error("signal.source invalid");
  if (!s.eventId || !s.marketSlug || !s.tokenId) throw new Error("signal identifiers missing");
  if (!Number.isFinite(s.impliedProb) || s.impliedProb < 0 || s.impliedProb > 1) throw new Error("signal.impliedProb invalid");
  if (!Number.isFinite(s.confidence) || s.confidence < 0 || s.confidence > 1) throw new Error("signal.confidence invalid");
  if (!s.rationale) throw new Error("signal.rationale required");
  return s;
}

export function parseRuntimeConfig(v: unknown): RuntimeConfig {
  const c = v as RuntimeConfig;
  if (!Number.isInteger(c.version) || c.version < 1) throw new Error("runtime version invalid");
  if (!Number.isFinite(c.updatedAtMs)) throw new Error("runtime updatedAtMs invalid");
  if (typeof c.paused !== "boolean") throw new Error("runtime paused invalid");
  if (!Number.isFinite(c.edgeThresholdBps) || c.edgeThresholdBps < 0 || c.edgeThresholdBps > 2000) throw new Error("runtime edgeThresholdBps invalid");
  if (!Number.isFinite(c.signalTtlSec) || c.signalTtlSec <= 0 || c.signalTtlSec > 600) throw new Error("runtime signalTtlSec invalid");
  if (!Number.isFinite(c.maxOrderUsd) || c.maxOrderUsd <= 0 || c.maxOrderUsd > 500) throw new Error("runtime maxOrderUsd invalid");
  if (!Number.isFinite(c.maxOrdersPerMin) || c.maxOrdersPerMin <= 0 || c.maxOrdersPerMin > 600) throw new Error("runtime maxOrdersPerMin invalid");
  return c;
}
