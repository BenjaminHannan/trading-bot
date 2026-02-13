import test from "node:test";
import assert from "node:assert/strict";
import { L2OrderBook } from "../src/clob/orderbook.js";

test("orderbook maintains best bid/ask and mid", () => {
  const b = new L2OrderBook();
  b.applyUpdate("BUY", 0.45, 10);
  b.applyUpdate("BUY", 0.44, 5);
  b.applyUpdate("SELL", 0.55, 8);
  b.applyUpdate("SELL", 0.57, 3);
  assert.equal(b.bestBid()?.price, 0.45);
  assert.equal(b.bestAsk()?.price, 0.55);
  assert.equal(b.mid(), 0.5);
});
