import { EnvConfig, RuntimeConfigUpdate } from "../shared/schema.js";

export interface RiskInput {
  orderUsd: number;
  projectedPositionUsd: number;
  drawdownUsd: number;
  marketDataAgeMs: number;
  reconnectCount: number;
}

export function canTrade(env: EnvConfig, runtime: RuntimeConfigUpdate, r: RiskInput): { ok: boolean; reason?: string } {
  if (!env.TRADING_ENABLED) return { ok: false, reason: "TRADING_ENABLED=false" };
  if (env.DRY_RUN) return { ok: false, reason: "DRY_RUN=true" };
  if (runtime.pauseTrading) return { ok: false, reason: "Paused by supervisor" };
  if (r.orderUsd > env.MAX_ORDER_USD) return { ok: false, reason: "Order > MAX_ORDER_USD" };
  if (Math.abs(r.projectedPositionUsd) > env.MAX_POSITION_USD) return { ok: false, reason: "Position > MAX_POSITION_USD" };
  if (r.drawdownUsd >= env.KILL_SWITCH_DRAWDOWN_USD) return { ok: false, reason: "Kill switch drawdown" };
  if (r.marketDataAgeMs > 5_000) return { ok: false, reason: "Stale market data" };
  if (r.reconnectCount > 8) return { ok: false, reason: "Too many reconnects" };
  return { ok: true };
}
