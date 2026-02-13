import test from "node:test";
import assert from "node:assert/strict";
import { riskCheck } from "../src/risk/riskEngine.js";

const env: any = {
  TRADING_ENABLED: true,
  DRY_RUN: false,
  MAX_ORDER_USD: 20,
  MAX_POSITION_USD: 100,
  MAX_ORDERS_PER_MIN: 2,
  KILL_SWITCH_DRAWDOWN_USD: 50
};

test("risk blocks oversize", () => {
  const r = riskCheck(env, { positionUsd: 0, drawdownUsd: 0, staleMarketDataMs: 10, reconnectCount: 0, ordersLastMinute: 0, paused: false }, 30);
  assert.equal(r.ok, false);
});

test("risk allows good order", () => {
  const r = riskCheck(env, { positionUsd: 0, drawdownUsd: 0, staleMarketDataMs: 10, reconnectCount: 0, ordersLastMinute: 0, paused: false }, 10);
  assert.equal(r.ok, true);
});
