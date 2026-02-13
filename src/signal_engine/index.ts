import { loadEnv } from "../config/env.js";
import { Logger } from "../shared/logger.js";
import { runSignalLoop } from "./signalLoop.js";

async function main(): Promise<void> {
  const env = loadEnv();
  const logger = new Logger("signal_engine", env.LOG_LEVEL);
  await runSignalLoop();
  logger.info("signal engine running");
}

main().catch((e) => {
  process.stderr.write(`SIGNAL_ENGINE_FATAL ${String(e)}\n`);
  process.exit(1);
});
