import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EnvConfig } from "../shared/schema.js";

function bool(v: string | undefined, d: boolean): boolean { return v === undefined ? d : v.toLowerCase() === "true"; }
function num(v: string | undefined, d: number): number { if (v === undefined) return d; const n = Number(v); if (!Number.isFinite(n)) throw new Error(`invalid number ${v}`); return n; }

export function loadDotEnv(path = ".env"): void {
  const full = resolve(path);
  if (!existsSync(full)) return;
  const raw = readFileSync(full, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [k, ...rest] = line.split("=");
    if (!(k in process.env)) process.env[k.trim()] = rest.join("=").trim();
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
    DRY_RUN: bool(process.env.DRY_RUN, true),
    TRADING_ENABLED: bool(process.env.TRADING_ENABLED, false),
    SIGNAL_ENGINE_ENABLED: bool(process.env.SIGNAL_ENGINE_ENABLED, true),
    MARKET_INDEX_REFRESH_SEC: num(process.env.MARKET_INDEX_REFRESH_SEC, 60),
    SIGNAL_CHANNEL_PATH: process.env.SIGNAL_CHANNEL_PATH ?? "./signals.jsonl",
    RUNTIME_CONFIG_PATH: process.env.RUNTIME_CONFIG_PATH ?? "./runtime-config.json",
    STATE_SNAPSHOT_PATH: process.env.STATE_SNAPSHOT_PATH ?? "./state-snapshot.json",
    MAX_POSITION_USD: num(process.env.MAX_POSITION_USD, 200),
    MAX_ORDER_USD: num(process.env.MAX_ORDER_USD, 20),
    MAX_ORDERS_PER_MIN: num(process.env.MAX_ORDERS_PER_MIN, 20),
    KILL_SWITCH_DRAWDOWN_USD: num(process.env.KILL_SWITCH_DRAWDOWN_USD, 100),
    EDGE_THRESHOLD_BPS: num(process.env.EDGE_THRESHOLD_BPS, 50),
    SIGNAL_TTL_SEC: num(process.env.SIGNAL_TTL_SEC, 10),
    LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig["LOG_LEVEL"]) ?? "info",
    GEO_BLOCKED_COUNTRIES: (process.env.GEO_BLOCKED_COUNTRIES ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
    COUNTRY_CODE: (process.env.COUNTRY_CODE ?? "").trim().toUpperCase()
  };
}
