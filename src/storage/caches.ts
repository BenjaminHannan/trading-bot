import { writeFileSync, readFileSync, existsSync } from "node:fs";

export function writeCache<T>(path: string, v: T): void { writeFileSync(path, JSON.stringify(v, null, 2)); }
export function readCache<T>(path: string): T | null { if (!existsSync(path)) return null; return JSON.parse(readFileSync(path, "utf8")) as T; }
