import { runTrader } from "./traderLoop.js";

runTrader().catch((e) => {
  process.stderr.write(`TRADER_FATAL ${String(e)}\n`);
  process.exit(1);
});
