import { renameSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { RuntimeConfigUpdate } from "./schema.js";

export const SAFE_MAX = {
  edgeTicks: 20,
  orderSizeUsd: 100,
  maxOrdersPerMin: 120
};

export const defaultRuntimeConfig: RuntimeConfigUpdate = {
  version: 1,
  timestamp: new Date(0).toISOString(),
  pauseTrading: false,
  conservativeMode: false,
  edgeTicks: 2,
  orderSizeUsd: 10,
  maxOrdersPerMin: 20
};

export function validateRuntimeConfig(candidate: RuntimeConfigUpdate): RuntimeConfigUpdate {
  if (!Number.isInteger(candidate.version) || candidate.version < 1) throw new Error("Invalid version");
  if (!Number.isFinite(Date.parse(candidate.timestamp))) throw new Error("Invalid timestamp");
  if (candidate.edgeTicks < 1 || candidate.edgeTicks > SAFE_MAX.edgeTicks) throw new Error("edgeTicks out of bounds");
  if (candidate.orderSizeUsd <= 0 || candidate.orderSizeUsd > SAFE_MAX.orderSizeUsd) throw new Error("orderSizeUsd out of bounds");
  if (!Number.isInteger(candidate.maxOrdersPerMin) || candidate.maxOrdersPerMin < 1 || candidate.maxOrdersPerMin > SAFE_MAX.maxOrdersPerMin) {
    throw new Error("maxOrdersPerMin out of bounds");
  }
  return candidate;
}

export function writeRuntimeConfigAtomic(path: string, config: RuntimeConfigUpdate): void {
  validateRuntimeConfig(config);
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2));
  renameSync(tmp, path);
}

export function readRuntimeConfig(path: string): RuntimeConfigUpdate {
  if (!existsSync(path)) return defaultRuntimeConfig;
  const parsed = JSON.parse(readFileSync(path, "utf8")) as RuntimeConfigUpdate;
  return validateRuntimeConfig(parsed);
}
