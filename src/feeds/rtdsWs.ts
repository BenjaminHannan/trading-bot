import { Logger } from "../shared/logger.js";

export interface RtdsEvent { id: string; text: string; createdAtMs: number }
const URL = "wss://ws-live-data.polymarket.com";

export class RtdsWs {
  private ws: WebSocket | null = null;
  constructor(private readonly logger: Logger, private readonly onEvent: (e: RtdsEvent) => void) {}

  start(): void {
    this.ws = new WebSocket(URL);
    this.ws.onopen = () => this.logger.info("rtds ws connected");
    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data)) as any;
        this.onEvent({ id: String(msg.id ?? `${Date.now()}`), text: String(msg.text ?? msg.comment ?? msg.asset ?? "rtds_event"), createdAtMs: Date.now() });
      } catch {
        this.logger.warn("rtds ws parse failure");
      }
    };
    this.ws.onclose = () => setTimeout(() => this.start(), 1500);
  }
}
