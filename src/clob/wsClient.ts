import { Logger } from "../shared/logger.js";

const WS_BASE = "wss://ws-subscriptions-clob.polymarket.com/ws/";

export interface WsHandlers {
  onMessage: (msg: unknown) => void;
  onReconnect?: (count: number) => void;
}

export class PolymarketWsClient {
  private ws: WebSocket | null = null;
  private reconnects = 0;
  private closedByUser = false;

  constructor(private readonly logger: Logger, private readonly handlers: WsHandlers) {}

  connect(subscribePayload: Record<string, unknown>): void {
    this.closedByUser = false;
    this.ws = new WebSocket(WS_BASE);
    this.ws.onopen = () => {
      this.reconnects = 0;
      this.ws?.send(JSON.stringify(subscribePayload));
      this.logger.info("ws connected");
    };
    this.ws.onmessage = (evt) => {
      try {
        this.handlers.onMessage(JSON.parse(String(evt.data)));
      } catch {
        this.logger.warn("failed to parse ws message");
      }
    };
    this.ws.onclose = () => {
      if (!this.closedByUser) this.reconnect(subscribePayload);
    };
    this.ws.onerror = () => this.logger.warn("ws error");
  }

  close(): void {
    this.closedByUser = true;
    this.ws?.close();
  }

  private reconnect(payload: Record<string, unknown>): void {
    this.reconnects += 1;
    this.handlers.onReconnect?.(this.reconnects);
    const backoff = Math.min(500 * 2 ** this.reconnects, 10_000);
    setTimeout(() => this.connect(payload), backoff);
  }
}
