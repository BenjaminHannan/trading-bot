import { loadEnv } from "../config/env.js";
import { Logger } from "../shared/logger.js";
import { readStateSnapshot } from "../shared/stateStore.js";
import { defaultRuntimeConfig, readRuntimeConfig, writeRuntimeConfigAtomic } from "../shared/runtimeConfig.js";
import { detectAnomalies } from "./heuristics.js";
import { recommendConfig } from "./recommender.js";
import { writeJson } from "../storage/fileStore.js";

export async function runSupervisor(): Promise<void> {
  const env = loadEnv();
  const logger = new Logger("supervisor", env.LOG_LEVEL);
  if (!env.SUPERVISOR_ENABLED) {
    logger.warn("supervisor disabled");
    return;
  }

  setInterval(() => {
    const snapshot = readStateSnapshot(env.STATE_SNAPSHOT_PATH);
    if (!snapshot) return;
    const current = (() => {
      try { return readRuntimeConfig(env.CONFIG_CHANNEL_PATH); }
      catch { return defaultRuntimeConfig; }
    })();

    const anomalies = detectAnomalies(snapshot);
    const next = recommendConfig(current, snapshot, anomalies);
    if (next.note !== "no_change") {
      writeRuntimeConfigAtomic(env.CONFIG_CHANNEL_PATH, next);
      writeJson("./supervisor-decision-report.json", { timestamp: next.timestamp, anomalies, applied: next });
      logger.warn("supervisor applied config update", { anomalies, version: next.version });
    } else {
      logger.info("supervisor healthy");
    }
  }, 10_000);
}
