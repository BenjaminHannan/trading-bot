import { Logger } from "../shared/logger.js";

const URL = "wss://ws-subscriptions-clob.polymarket.com/ws/";

export class ClobUserWs {
  private ws: WebSocket | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly auth: { key?: string; secret?: string; passphrase?: string },
    private readonly onFill: (fill: { orderId: string; price: number; size: number; side: string }) => void
  ) {}

  start(): void {
    this.ws = new WebSocket(URL);
    this.ws.onopen = () => this.ws?.send(JSON.stringify({ type: "user", auth: this.auth }));
    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data)) as any;
        if (msg?.event_type === "fill") this.onFill({ orderId: String(msg.order_id), price: Number(msg.price), size: Number(msg.size), side: String(msg.side) });
      } catch {
        this.logger.warn("clob user parse error");
      }
    };
    this.ws.onclose = () => setTimeout(() => this.start(), 1500);
  }
}
