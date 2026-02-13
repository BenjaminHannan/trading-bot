import { runTrader } from "./traderLoop.js";

runTrader().catch((error) => {
  process.stderr.write(`TRADER_FATAL ${String(error)}\n`);
  process.exit(1);
});
