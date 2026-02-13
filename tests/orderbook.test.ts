import test from "node:test";
import assert from "node:assert/strict";
import { matchMarket } from "../src/gamma/matchMarket.js";

test("match market returns best candidate", () => {
  const r = matchMarket("lakers", [
    { slug: "nba-lakers-win", title: "Will Lakers win", tags: ["nba"], tokenIds: ["1"], raw: {} as any },
    { slug: "btc-100k", title: "Will BTC > 100k", tags: ["crypto"], tokenIds: ["2"], raw: {} as any }
  ]);
  assert.equal(r?.tokenId, "1");
});
