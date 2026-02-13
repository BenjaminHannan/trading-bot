import test from "node:test";
import assert from "node:assert/strict";
import { buildSignalOrders } from "../src/strategy/signalDrivenStrategy.js";

test("strategy emits buy order when fair > mid with enough edge", () => {
  const orders = buildSignalOrders({
    signal: { version: 1, createdAtMs: Date.now(), ttlSec: 10, source: "manual", eventId: "e", marketSlug: "m", tokenId: "t", impliedProb: 0.6, confidence: 0.8, rationale: "r" },
    mid: 0.5,
    bestBid: 0.49,
    bestAsk: 0.51,
    edgeThresholdBps: 50,
    maxOrderUsd: 20
  });
  assert.equal(orders[0]?.side, "BUY");
});
