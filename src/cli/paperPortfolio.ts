import { loadEnv } from "../config/env.js";
import { loadPaperPortfolio } from "../storage/paperPortfolio.js";

function main(): void {
  const env = loadEnv();
  const p = loadPaperPortfolio(env.PAPER_PORTFOLIO_PATH, env.PAPER_STARTING_CASH_USD);
  console.log(`Paper portfolio file: ${env.PAPER_PORTFOLIO_PATH}`);
  console.log(`Starting cash: $${p.startingCashUsd.toFixed(2)}`);
  console.log(`Cash: $${p.cashUsd.toFixed(2)}`);
  console.log(`Position shares: ${p.positionShares.toFixed(4)}`);
  console.log(`Avg entry: ${p.avgEntryPrice.toFixed(4)}`);
  console.log(`Mark: ${p.markPrice === null ? "n/a" : p.markPrice.toFixed(4)}`);
  console.log(`Realized PnL: $${p.realizedPnlUsd.toFixed(2)}`);
  console.log(`Unrealized PnL: $${p.unrealizedPnlUsd.toFixed(2)}`);
  console.log(`Equity: $${p.equityUsd.toFixed(2)}`);
  console.log(`Trades: ${p.tradeCount}`);
  console.log(`Last updated: ${p.lastUpdated}`);
}

main();
