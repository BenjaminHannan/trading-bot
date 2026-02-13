import { Logger } from "../shared/logger.js";

export interface SportsEvent { id: string; text: string; home?: number; away?: number; createdAtMs: number }

const URL = "wss://sports-api.polymarket.com/ws";

export class SportsWs {
  private ws: WebSocket | null = null;
  constructor(private readonly logger: Logger, private readonly onEvent: (e: SportsEvent) => void) {}

  start(): void {
    this.ws = new WebSocket(URL);
    this.ws.onopen = () => this.logger.info("sports ws connected");
    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(String(evt.data)) as any;
        const text = String(msg.title ?? msg.event ?? msg.type ?? "sports_update");
        this.onEvent({ id: String(msg.id ?? `${Date.now()}`), text, home: msg.homeScore, away: msg.awayScore, createdAtMs: Date.now() });
      } catch {
        this.logger.warn("sports ws parse failure");
      }
    };
    this.ws.onclose = () => setTimeout(() => this.start(), 1000);
  }
}
