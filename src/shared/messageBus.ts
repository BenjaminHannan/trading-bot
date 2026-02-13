import { EventEmitter } from "node:events";

export interface InternalEvents {
  bookUpdate: { tokenId: string; bid: number; ask: number; ts: number };
  fill: { orderId: string; price: number; size: number; side: "BUY" | "SELL"; ts: number };
  runtimeConfigApplied: { version: number; ts: number };
}

export class MessageBus extends EventEmitter {
  emitEvent<K extends keyof InternalEvents>(event: K, payload: InternalEvents[K]): void {
    this.emit(event, payload);
  }
  onEvent<K extends keyof InternalEvents>(event: K, handler: (payload: InternalEvents[K]) => void): void {
    this.on(event, handler);
  }
}
