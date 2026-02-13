import { existsSync, readFileSync, writeFileSync } from "node:fs";

export interface PaperFill {
  ts: string;
  side: "BUY" | "SELL";
  price: number;
  size: number;
  notionalUsd: number;
}

export interface PaperPortfolio {
  startingCashUsd: number;
  cashUsd: number;
  positionShares: number;
  avgEntryPrice: number;
  realizedPnlUsd: number;
  markPrice: number | null;
  unrealizedPnlUsd: number;
  equityUsd: number;
  tradeCount: number;
  lastUpdated: string;
  fills: PaperFill[];
}

export function createPaperPortfolio(startingCashUsd: number): PaperPortfolio {
  return {
    startingCashUsd,
    cashUsd: startingCashUsd,
    positionShares: 0,
    avgEntryPrice: 0,
    realizedPnlUsd: 0,
    markPrice: null,
    unrealizedPnlUsd: 0,
    equityUsd: startingCashUsd,
    tradeCount: 0,
    lastUpdated: new Date().toISOString(),
    fills: []
  };
}

export function loadPaperPortfolio(path: string, startingCashUsd: number): PaperPortfolio {
  if (!existsSync(path)) {
    const p = createPaperPortfolio(startingCashUsd);
    savePaperPortfolio(path, p);
    return p;
  }
  return JSON.parse(readFileSync(path, "utf8")) as PaperPortfolio;
}

export function savePaperPortfolio(path: string, p: PaperPortfolio): void {
  writeFileSync(path, JSON.stringify(p, null, 2));
}

export function applyPaperFill(
  portfolio: PaperPortfolio,
  fill: { side: "BUY" | "SELL"; price: number; size: number },
  markPrice: number | null
): PaperPortfolio {
  const notionalUsd = fill.price * fill.size;

  if (fill.side === "BUY") {
    const nextPosition = portfolio.positionShares + fill.size;
    const weightedCost = portfolio.avgEntryPrice * portfolio.positionShares + notionalUsd;
    portfolio.positionShares = nextPosition;
    portfolio.avgEntryPrice = nextPosition > 0 ? weightedCost / nextPosition : 0;
    portfolio.cashUsd -= notionalUsd;
  } else {
    const closingSize = Math.min(portfolio.positionShares, fill.size);
    const pnl = (fill.price - portfolio.avgEntryPrice) * closingSize;
    portfolio.realizedPnlUsd += pnl;
    portfolio.positionShares = Math.max(0, portfolio.positionShares - fill.size);
    portfolio.cashUsd += notionalUsd;
    if (portfolio.positionShares === 0) portfolio.avgEntryPrice = 0;
  }

  portfolio.tradeCount += 1;
  portfolio.fills.push({
    ts: new Date().toISOString(),
    side: fill.side,
    price: fill.price,
    size: fill.size,
    notionalUsd
  });
  if (portfolio.fills.length > 200) portfolio.fills = portfolio.fills.slice(-200);

  updateMark(portfolio, markPrice);
  return portfolio;
}

export function updateMark(portfolio: PaperPortfolio, markPrice: number | null): void {
  portfolio.markPrice = markPrice;
  portfolio.unrealizedPnlUsd = markPrice === null
    ? 0
    : (markPrice - portfolio.avgEntryPrice) * portfolio.positionShares;
  portfolio.equityUsd = portfolio.cashUsd + (markPrice === null ? 0 : markPrice * portfolio.positionShares);
  portfolio.lastUpdated = new Date().toISOString();
}
