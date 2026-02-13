import { appendFileSync, writeFileSync } from "node:fs";

export function appendJsonLine(path: string, record: unknown): void {
  appendFileSync(path, `${JSON.stringify(record)}\n`);
}

export function writeJson(path: string, record: unknown): void {
  writeFileSync(path, JSON.stringify(record, null, 2));
}
