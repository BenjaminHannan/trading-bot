import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeRuntimeConfigAtomic, readRuntimeConfig, defaultRuntimeConfig } from "../src/shared/runtimeConfig.js";

test("runtime config write/read atomic", () => {
  const dir = mkdtempSync(join(tmpdir(), "cfg-"));
  const path = join(dir, "runtime.json");
  const next = { ...defaultRuntimeConfig, version: 2, timestamp: new Date().toISOString(), edgeTicks: 3 };
  writeRuntimeConfigAtomic(path, next);
  const raw = readFileSync(path, "utf8");
  assert.ok(raw.includes('"version": 2'));
  const loaded = readRuntimeConfig(path);
  assert.equal(loaded.edgeTicks, 3);
});
