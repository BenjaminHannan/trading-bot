export interface LatencyMetric {
  marketDataTs: number;
  decisionTs: number;
  submitTs: number;
  ackTs: number;
}

export function computeLatency(metric: LatencyMetric): number {
  return metric.ackTs - metric.marketDataTs;
}
