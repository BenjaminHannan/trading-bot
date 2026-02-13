import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { TraderStateSnapshot } from "./schema.js";

export function writeStateSnapshot(path: string, snapshot: TraderStateSnapshot): void {
  writeFileSync(path, JSON.stringify(snapshot, null, 2));
}

export function readStateSnapshot(path: string): TraderStateSnapshot | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as TraderStateSnapshot;
}
