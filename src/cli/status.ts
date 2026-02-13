import { loadEnv } from "../config/env.js";
import { readStateSnapshot } from "../shared/stateStore.js";

function main(): void {
  const env = loadEnv();
  const snapshot = readStateSnapshot(env.STATE_SNAPSHOT_PATH);
  if (!snapshot) {
    console.log("No snapshot found");
    return;
  }

  console.log(`Market: ${snapshot.market}`);
  console.log(`Token: ${snapshot.tokenId}`);
  console.log(`Paused: ${snapshot.paused}`);
  console.log(`Mid: ${snapshot.lastMid}`);
  console.log(`Inventory: ${snapshot.inventory}`);
  console.log(`Reconnects: ${snapshot.reconnectCount}`);
}

main();
