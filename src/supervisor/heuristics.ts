import { TraderStateSnapshot } from "../shared/schema.js";

export function detectAnomalies(snapshot: TraderStateSnapshot): string[] {
  const anomalies: string[] = [];
  if (snapshot.staleMarketData) anomalies.push("stale_market_data");
  if (snapshot.metrics.wsDisconnectRate > 1) anomalies.push("high_disconnect_rate");
  if (snapshot.metrics.orderRejectRate > 0.1) anomalies.push("high_reject_rate");
  if (snapshot.metrics.avgSubmitLatencyMs > 800) anomalies.push("high_order_latency");
  if (snapshot.drawdownUsd > 0 && snapshot.drawdownUsd > 0.8 * 100) anomalies.push("drawdown_trajectory_bad");
  return anomalies;
}
