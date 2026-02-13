import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { StateSnapshot } from "../shared/schema.js";

export function writeSnapshot(path: string, s: StateSnapshot): void { writeFileSync(path, JSON.stringify(s, null, 2)); }
export function readSnapshot(path: string): StateSnapshot | null { if (!existsSync(path)) return null; return JSON.parse(readFileSync(path, "utf8")) as StateSnapshot; }
