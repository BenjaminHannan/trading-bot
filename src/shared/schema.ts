export type OutcomeSide = "YES" | "NO";

export interface EnvConfig {
  PRIVATE_KEY?: string;
  CLOB_API_KEY?: string;
  CLOB_API_SECRET?: string;
  CLOB_API_PASSPHRASE?: string;
  RPC_URL?: string;
  MARKET_QUERY: string;
  OUTCOME_SIDE: OutcomeSide;
  MAX_POSITION_USD: number;
  MAX_ORDER_USD: number;
  MAX_ORDERS_PER_MIN: number;
  KILL_SWITCH_DRAWDOWN_USD: number;
  DRY_RUN: boolean;
  TRADING_ENABLED: boolean;
  SUPERVISOR_ENABLED: boolean;
  CONFIG_CHANNEL_PATH: string;
  STATE_SNAPSHOT_PATH: string;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  GEO_BLOCKED_COUNTRIES: string[];
  PAPER_PORTFOLIO_PATH: string;
  PAPER_STARTING_CASH_USD: number;

}

export interface RuntimeConfigUpdate {
  version: number;
  timestamp: string;
  pauseTrading: boolean;
  conservativeMode: boolean;
  edgeTicks: number;
  orderSizeUsd: number;
  maxOrdersPerMin: number;
  note?: string;
}

export interface TraderStateSnapshot {
  timestamp: string;
  market: string;
  tokenId: string;
  paused: boolean;
  conservativeMode: boolean;
  reconnectCount: number;
  staleMarketData: boolean;
  lastMid: number | null;
  inventory: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  drawdownUsd: number;
  openOrders: Array<{ id: string; side: "BUY" | "SELL"; price: number; size: number }>;
  metrics: {
    wsDisconnectRate: number;
    orderRejectRate: number;
    avgSubmitLatencyMs: number;
  };
}

export function assertFinitePositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive finite number`);
  }
}
