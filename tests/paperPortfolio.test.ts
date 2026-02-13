import test from "node:test";
import assert from "node:assert/strict";
import { createPaperPortfolio, applyPaperFill, updateMark } from "../src/storage/paperPortfolio.js";

test("paper portfolio tracks cash/position/pnl", () => {
  const p = createPaperPortfolio(1000);
  applyPaperFill(p, { side: "BUY", price: 0.4, size: 100 }, 0.4);
  assert.equal(Math.round(p.cashUsd), 960);
  assert.equal(p.positionShares, 100);

  applyPaperFill(p, { side: "SELL", price: 0.5, size: 40 }, 0.5);
  assert.equal(p.positionShares, 60);
  assert.ok(p.realizedPnlUsd > 0);

  updateMark(p, 0.55);
  assert.ok(p.unrealizedPnlUsd > 0);
  assert.ok(p.equityUsd > p.startingCashUsd);
});
