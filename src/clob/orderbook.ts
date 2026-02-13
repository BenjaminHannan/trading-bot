export interface BookLevel { price: number; size: number }

export class L2OrderBook {
  bids = new Map<number, number>();
  asks = new Map<number, number>();
  lastUpdateTs = 0;

  applyUpdate(side: "BUY" | "SELL", price: number, size: number, ts = Date.now()): void {
    const book = side === "BUY" ? this.bids : this.asks;
    if (size <= 0) book.delete(price);
    else book.set(price, size);
    this.lastUpdateTs = ts;
  }

  bestBid(): BookLevel | null {
    if (this.bids.size === 0) return null;
    const price = Math.max(...this.bids.keys());
    return { price, size: this.bids.get(price)! };
  }

  bestAsk(): BookLevel | null {
    if (this.asks.size === 0) return null;
    const price = Math.min(...this.asks.keys());
    return { price, size: this.asks.get(price)! };
  }

  mid(): number | null {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    if (!bid || !ask) return null;
    return (bid.price + ask.price) / 2;
  }

  spread(): number | null {
    const bid = this.bestBid();
    const ask = this.bestAsk();
    if (!bid || !ask) return null;
    return ask.price - bid.price;
  }
}
