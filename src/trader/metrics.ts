export interface TraderMetrics {
  ordersPlaced: number;
  signalsSeen: number;
  lastSignalAtMs?: number;
}

export const initMetrics = (): TraderMetrics => ({ ordersPlaced: 0, signalsSeen: 0 });
