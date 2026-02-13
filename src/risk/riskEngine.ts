import { EnvConfig } from "../shared/schema.js";

export interface RiskState {
  positionUsd: number;
  drawdownUsd: number;
  staleMarketDataMs: number;
  reconnectCount: number;
  ordersLastMinute: number;
  paused: boolean;
}

export function riskCheck(env: EnvConfig, state: RiskState, orderUsd: number): { ok: boolean; reason?: string } {
  if (!env.TRADING_ENABLED) return { ok: false, reason: "TRADING_ENABLED=false" };
  if (env.DRY_RUN) return { ok: false, reason: "DRY_RUN=true" };
  if (state.paused) return { ok: false, reason: "paused" };
  if (orderUsd > env.MAX_ORDER_USD) return { ok: false, reason: "max_order_usd" };
  if (Math.abs(state.positionUsd + orderUsd) > env.MAX_POSITION_USD) return { ok: false, reason: "max_position_usd" };
  if (state.ordersLastMinute >= env.MAX_ORDERS_PER_MIN) return { ok: false, reason: "rate_limit" };
  if (state.drawdownUsd >= env.KILL_SWITCH_DRAWDOWN_USD) return { ok: false, reason: "kill_switch" };
  if (state.staleMarketDataMs > 5000) return { ok: false, reason: "stale_market_data" };
  if (state.reconnectCount > 8) return { ok: false, reason: "reconnect_circuit_breaker" };
  return { ok: true };
}
