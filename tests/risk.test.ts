import test from "node:test";
import assert from "node:assert/strict";
import { canTrade } from "../src/risk/riskEngine.js";
import { defaultRuntimeConfig } from "../src/shared/runtimeConfig.js";

const env: any = {
  TRADING_ENABLED: true,
  DRY_RUN: false,
  MAX_ORDER_USD: 20,
  MAX_POSITION_USD: 100,
  KILL_SWITCH_DRAWDOWN_USD: 50
};

test("risk blocks oversize order", () => {
  const r = canTrade(env, defaultRuntimeConfig, { orderUsd: 25, projectedPositionUsd: 10, drawdownUsd: 0, marketDataAgeMs: 10, reconnectCount: 0 });
  assert.equal(r.ok, false);
});

test("risk kill switch", () => {
  const r = canTrade(env, defaultRuntimeConfig, { orderUsd: 5, projectedPositionUsd: 10, drawdownUsd: 60, marketDataAgeMs: 10, reconnectCount: 0 });
  assert.equal(r.ok, false);
});
