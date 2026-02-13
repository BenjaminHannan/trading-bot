import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { EnvConfig } from "../shared/schema.js";

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number: ${value}`);
  return parsed;
}

export function loadDotEnv(path = ".env"): void {
  const full = resolve(path);
  if (!existsSync(full)) return;
  const raw = readFileSync(full, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

export function loadEnv(): EnvConfig {
  loadDotEnv();
  return {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CLOB_API_KEY: process.env.CLOB_API_KEY,
    CLOB_API_SECRET: process.env.CLOB_API_SECRET,
    CLOB_API_PASSPHRASE: process.env.CLOB_API_PASSPHRASE,
    RPC_URL: process.env.RPC_URL,
    MARKET_QUERY: process.env.MARKET_QUERY ?? "",
    OUTCOME_SIDE: process.env.OUTCOME_SIDE === "NO" ? "NO" : "YES",
    MAX_POSITION_USD: parseNumber(process.env.MAX_POSITION_USD, 200),
    MAX_ORDER_USD: parseNumber(process.env.MAX_ORDER_USD, 20),
    MAX_ORDERS_PER_MIN: parseNumber(process.env.MAX_ORDERS_PER_MIN, 20),
    KILL_SWITCH_DRAWDOWN_USD: parseNumber(process.env.KILL_SWITCH_DRAWDOWN_USD, 100),
    DRY_RUN: parseBoolean(process.env.DRY_RUN, true),
    TRADING_ENABLED: parseBoolean(process.env.TRADING_ENABLED, false),
    SUPERVISOR_ENABLED: parseBoolean(process.env.SUPERVISOR_ENABLED, true),
    CONFIG_CHANNEL_PATH: process.env.CONFIG_CHANNEL_PATH ?? "./runtime-config.json",
    STATE_SNAPSHOT_PATH: process.env.STATE_SNAPSHOT_PATH ?? "./state-snapshot.json",
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig["LOG_LEVEL"]) ?? "info",
    GEO_BLOCKED_COUNTRIES: (process.env.GEO_BLOCKED_COUNTRIES ?? "US,UK").split(",").map((v: string) => v.trim()).filter(Boolean)
  };
}
