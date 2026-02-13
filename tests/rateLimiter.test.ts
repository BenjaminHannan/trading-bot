import test from "node:test";
import assert from "node:assert/strict";
import { SignalDedupe } from "../src/signal_engine/dedupe.js";

test("dedupe suppresses repeats in ttl", () => {
  const d = new SignalDedupe();
  assert.equal(d.shouldEmit("k", 1000, 5000), true);
  assert.equal(d.shouldEmit("k", 2000, 5000), false);
  assert.equal(d.shouldEmit("k", 7001, 5000), true);
});
