import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeRuntimeConfigAtomic, readRuntimeConfig } from "../src/shared/messageBus.js";

test("runtime config atomic read write", () => {
  const dir = mkdtempSync(join(tmpdir(), "rt-"));
  const path = join(dir, "cfg.json");
  const cfg = { version: 1, updatedAtMs: Date.now(), paused: false, edgeThresholdBps: 50, signalTtlSec: 10, maxOrderUsd: 20, maxOrdersPerMin: 10 };
  writeRuntimeConfigAtomic(path, cfg);
  const got = readRuntimeConfig(path, cfg);
  assert.equal(got.version, 1);
});
