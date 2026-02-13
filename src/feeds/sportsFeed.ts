import { Logger } from "../shared/logger.js";

const SPORTS_WS = "wss://sports-api.polymarket.com/ws";

export class SportsSignalFeed {
  private ws: WebSocket | null = null;
  constructor(private readonly logger: Logger, private readonly onSignal: (shift: number) => void) {}

  start(): void {
    this.ws = new WebSocket(SPORTS_WS);
    this.ws.onopen = () => this.logger.info("sports feed connected");
    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data)) as { type?: string; urgency?: number };
        if (msg.type === "score_update") this.onSignal(Math.max(-0.03, Math.min(0.03, (msg.urgency ?? 0) * 0.005)));
      } catch {
        this.logger.debug("sports message parse error");
      }
    };
  }

  stop(): void { this.ws?.close(); }
}
