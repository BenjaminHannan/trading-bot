import test from "node:test";
import assert from "node:assert/strict";
import { parseSignal } from "../src/shared/schema.js";

test("signal schema strict parse", () => {
  const s = parseSignal({ version: 1, createdAtMs: Date.now(), ttlSec: 10, source: "manual", eventId: "e1", marketSlug: "m", tokenId: "t", impliedProb: 0.5, confidence: 0.9, rationale: "x" });
  assert.equal(s.version, 1);
});
