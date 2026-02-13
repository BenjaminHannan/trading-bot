import { Logger } from "../shared/logger.js";
import { PolymarketWsClient } from "./wsClient.js";

export interface UserState {
  openOrders: Record<string, { side: "BUY" | "SELL"; price: number; size: number }>;
  fills: Array<{ orderId: string; price: number; size: number }>;
}

export function startUserStream(
  logger: Logger,
  auth: { apiKey?: string; secret?: string; passphrase?: string },
  onUpdate: (state: UserState) => void
): PolymarketWsClient {
  const state: UserState = { openOrders: {}, fills: [] };
  const ws = new PolymarketWsClient(logger, {
    onMessage: (msg: any) => {
      if (msg?.event_type === "order") {
        state.openOrders[msg.order_id] = { side: msg.side, price: Number(msg.price), size: Number(msg.size) };
      }
      if (msg?.event_type === "fill") {
        state.fills.push({ orderId: msg.order_id, price: Number(msg.price), size: Number(msg.size) });
      }
      if (msg?.event_type === "cancel") {
        delete state.openOrders[msg.order_id];
      }
      onUpdate(state);
    }
  });

  ws.connect({ type: "user", auth });
  return ws;
}
