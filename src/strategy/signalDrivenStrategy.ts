import { Signal } from "../shared/schema.js";

export interface PlanOrder { side: "BUY" | "SELL"; price: number; size: number; reason: string }

export function buildSignalOrders(input: {
  signal: Signal;
  mid: number;
  bestBid: number;
  bestAsk: number;
  edgeThresholdBps: number;
  maxOrderUsd: number;
}): PlanOrder[] {
  const fair = input.signal.impliedProb;
  const edge = (fair - input.mid) * 10_000;
  if (Math.abs(edge) < input.edgeThresholdBps) return [];
  const side: "BUY" | "SELL" = edge > 0 ? "BUY" : "SELL";
  const px = side === "BUY" ? Math.min(fair, input.bestAsk) : Math.max(fair, input.bestBid);
  const size = input.maxOrderUsd / Math.max(px, 0.01);
  return [{ side, price: Number(px.toFixed(4)), size: Number(size.toFixed(4)), reason: `edge_bps=${edge.toFixed(1)}` }];
}
