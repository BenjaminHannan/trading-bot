import test from "node:test";
import assert from "node:assert/strict";
import { SlidingWindowRateLimiter } from "../src/risk/rateLimiter.js";

test("rate limiter enforces max per minute", () => {
  const l = new SlidingWindowRateLimiter(2);
  assert.equal(l.allow(1_000), true);
  assert.equal(l.allow(2_000), true);
  assert.equal(l.allow(3_000), false);
  assert.equal(l.allow(70_000), true);
});
