export interface QuoteParams {
  mid: number;
  inventory: number;
  edgeTicks: number;
  tickSize: number;
  orderSizeUsd: number;
  conservativeMode: boolean;
}

export interface Quote {
  bidPrice: number;
  askPrice: number;
  buySize: number;
  sellSize: number;
}

export function generateInventoryAwareQuote(p: QuoteParams): Quote {
  const conservatism = p.conservativeMode ? 2 : 1;
  const inventorySkewTicks = Math.max(-3, Math.min(3, -Math.round(p.inventory / 20)));
  const totalEdge = (p.edgeTicks * conservatism + inventorySkewTicks) * p.tickSize;
  const bidPrice = Math.max(0.01, p.mid - totalEdge);
  const askPrice = Math.min(0.99, p.mid + totalEdge);
  const buySize = p.orderSizeUsd / Math.max(bidPrice, 0.01);
  const sellSize = p.orderSizeUsd / Math.max(askPrice, 0.01);
  return { bidPrice, askPrice, buySize, sellSize };
}
