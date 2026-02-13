import test from "node:test";
import assert from "node:assert/strict";
import { generateInventoryAwareQuote } from "../src/strategy/marketMaking.js";

test("strategy generates bounded quotes", () => {
  const q = generateInventoryAwareQuote({ mid: 0.5, inventory: 10, edgeTicks: 2, tickSize: 0.001, orderSizeUsd: 10, conservativeMode: false });
  assert.ok(q.bidPrice < 0.5);
  assert.ok(q.askPrice > 0.5);
  assert.ok(q.buySize > 0);
});
