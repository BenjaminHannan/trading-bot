import { RuntimeConfigUpdate, TraderStateSnapshot } from "../shared/schema.js";

export function recommendConfig(
  current: RuntimeConfigUpdate,
  snapshot: TraderStateSnapshot,
  anomalies: string[]
): RuntimeConfigUpdate {
  const next: RuntimeConfigUpdate = {
    ...current,
    version: current.version + 1,
    timestamp: new Date().toISOString(),
    note: anomalies.join(",") || "no_change"
  };

  if (anomalies.includes("stale_market_data") || anomalies.includes("high_disconnect_rate")) {
    next.pauseTrading = true;
    next.conservativeMode = true;
  }
  if (anomalies.includes("high_order_latency")) next.maxOrdersPerMin = Math.max(1, Math.floor(current.maxOrdersPerMin * 0.5));
  if (anomalies.includes("high_reject_rate")) next.edgeTicks = Math.min(current.edgeTicks + 1, 20);
  if (snapshot.drawdownUsd > 50) {
    next.orderSizeUsd = Math.max(1, current.orderSizeUsd * 0.5);
    next.conservativeMode = true;
  }
  return next;
}
