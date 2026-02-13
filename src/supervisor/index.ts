import { runSupervisor } from "./supervisorLoop.js";

runSupervisor().catch((error) => {
  process.stderr.write(`SUPERVISOR_FATAL ${String(error)}\n`);
  process.exit(1);
});
