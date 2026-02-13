# Polymarket Two-Process Trading System (TypeScript)

## Important safety/legal notices
- **Geographic restrictions are enforced** at startup (`COUNTRY_CODE` checked against `GEO_BLOCKED_COUNTRIES`). If blocked, trader exits safely.
- **No bypass logic is implemented**.
- **No market manipulation behavior** exists in this baseline (no spoofing/wash trading routines).
- **Secrets are env-only** and never logged.
- **Safety-by-default**: `DRY_RUN=true` and `TRADING_ENABLED=false` by default.

## Architecture
- `src/trader`: low-latency event-driven trader loop using WebSocket market feed + user stream.
- `src/supervisor`: slower monitoring/recommendation loop that reads trader state and writes controlled runtime config updates.
- Shared file interface:
  - `CONFIG_CHANNEL_PATH` (runtime config update channel, atomic writes)
  - `STATE_SNAPSHOT_PATH` (trader state snapshots)
  - `PAPER_PORTFOLIO_PATH` (fake-money portfolio ledger for DRY_RUN)

## Endpoints used
- CLOB WebSocket: `wss://ws-subscriptions-clob.polymarket.com/ws/`
- CLOB REST: `https://clob.polymarket.com`
- Gamma API: `https://gamma-api.polymarket.com`
- Optional sports feed: `wss://sports-api.polymarket.com/ws`

## Setup
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env`.
3. Build:
   ```bash
   npm run build
   ```

## Run
- Trader:
  ```bash
  npm run trader
  ```
- Supervisor:
  ```bash
  npm run supervisor
  ```
- Market discovery CLI:
  ```bash
  npm run cli:select-market
  ```
- Snapshot status CLI:
  ```bash
  npm run cli:status
  ```
- Paper portfolio CLI:
  ```bash
  npm run cli:paper-portfolio
  ```

## Paper trading (fake money)
Keep:
- `DRY_RUN=true`
- `TRADING_ENABLED=false` (recommended for paper mode)

In this mode trader does not submit live orders. Instead it simulates fills for generated bid/ask quotes and writes portfolio results to `PAPER_PORTFOLIO_PATH`.

Configure:
- `PAPER_PORTFOLIO_PATH=./paper-portfolio.json`
- `PAPER_STARTING_CASH_USD=1000`

Then run trader and inspect fake portfolio:
```bash
npm run trader
npm run cli:paper-portfolio
```

## Live trading enablement
To enable live trading, you must explicitly set:
- `DRY_RUN=false`
- `TRADING_ENABLED=true`
- install official dependency `@polymarket/clob-client` and configure L2 API credentials.

If either safety flag is not enabled, trader refuses live order submission.

## Supervisor controls
Supervisor can only update runtime config and pause trading. It cannot submit orders.
Possible updates:
- `edgeTicks`
- `orderSizeUsd`
- `maxOrdersPerMin`
- `conservativeMode`
- `pauseTrading`

Trader validates updates against strict bounds and monotonically increasing versions.

## Conservative mode
When enabled, strategy widens edge and reduces aggression.

## Profitability disclaimer
This project provides a controlled framework and paper trading support, **not guaranteed profitability**. Validate performance in DRY_RUN for a long period before considering live trading.

## Testing
```bash
npm run test:run
```
Covers orderbook updates, risk/killswitch, limiter, strategy quotes, runtime config atomics.
