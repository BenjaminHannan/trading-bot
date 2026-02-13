import { appendFileSync, existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { Signal, parseSignal, RuntimeConfig, parseRuntimeConfig } from "./schema.js";

export function appendSignal(path: string, signal: Signal): void {
  parseSignal(signal);
  appendFileSync(path, `${JSON.stringify(signal)}\n`);
}

export function readSignalsSince(path: string, offset: number): { nextOffset: number; signals: Signal[] } {
  if (!existsSync(path)) return { nextOffset: 0, signals: [] };
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const slice = lines.slice(offset);
  return { nextOffset: lines.length, signals: slice.map((l: string) => parseSignal(JSON.parse(l))) };
}

export function writeRuntimeConfigAtomic(path: string, config: RuntimeConfig): void {
  parseRuntimeConfig(config);
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2));
  renameSync(tmp, path);
}

export function readRuntimeConfig(path: string, fallback: RuntimeConfig): RuntimeConfig {
  if (!existsSync(path)) return fallback;
  return parseRuntimeConfig(JSON.parse(readFileSync(path, "utf8")));
}
