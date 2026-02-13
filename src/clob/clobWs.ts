import { Logger } from "../shared/logger.js";

const URL = "wss://ws-subscriptions-clob.polymarket.com/ws/";

export interface TopOfBook { bid: number; ask: number; mid: number; ts: number }

export class ClobMarketWs {
  private ws: WebSocket | null = null;
  private reconnects = 0;
  constructor(private readonly logger: Logger, private readonly tokenId: string, private readonly onTop: (b: TopOfBook) => void) {}

  start(): void {
    this.ws = new WebSocket(URL);
    this.ws.onopen = () => {
      this.reconnects = 0;
      this.ws?.send(JSON.stringify({ type: "market", assets_ids: [this.tokenId] }));
    };
    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data)) as any;
        if (msg?.event_type !== "book") return;
        const bid = Number(msg?.bids?.[0]?.price ?? NaN);
        const ask = Number(msg?.asks?.[0]?.price ?? NaN);
        if (!Number.isFinite(bid) || !Number.isFinite(ask) || ask <= 0 || bid <= 0 || ask <= bid) return;
        this.onTop({ bid, ask, mid: (bid + ask) / 2, ts: Date.now() });
      } catch {
        this.logger.warn("clob market parse error");
      }
    };
    this.ws.onclose = () => {
      const backoff = Math.min(1000 * 2 ** (++this.reconnects), 10_000);
      setTimeout(() => this.start(), backoff);
    };
  }
}
