# Current Events → Polymarket Trades (Two-Process)

## Processes
1. **SIGNAL_ENGINE**: event-driven ingestion of public feeds (Sports WS + optional RTDS), market matching via Gamma, emits quantified signals to local signal channel.
2. **TRADER**: low-latency consumer of signals + CLOB market WS; executes when signal-implied fair probability creates edge beyond threshold.

## Official endpoints used
- CLOB REST: `https://clob.polymarket.com`
- CLOB WS: `wss://ws-subscriptions-clob.polymarket.com/ws/`
- Gamma: `https://gamma-api.polymarket.com`
- Sports WS: `wss://sports-api.polymarket.com/ws`
- RTDS WS (optional): `wss://ws-live-data.polymarket.com`

## Safety / compliance
- Geoblock check at startup (using `COUNTRY_CODE` vs `GEO_BLOCKED_COUNTRIES`); blocked => safe exit.
- WebSocket-first design to reduce REST polling.
- No manipulation logic (no spoofing/wash).
- Signals from public feeds only.
- Secrets loaded from env only; never logged.
- Safe defaults: `DRY_RUN=true`, `TRADING_ENABLED=false`.

## Structure
- `src/shared`: schema/validation, channel IO, time
- `src/gamma`: market fetch/index/match
- `src/feeds`: sports/rtds WS
- `src/signal_engine`: signal loop, models, dedupe
- `src/clob`: market/user websocket clients
- `src/strategy`: signal-driven order generation
- `src/risk`: limits / circuit breakers / kill switch
- `src/execution`: order executor (dry-run/live)
- `src/trader`: trading loop and metrics
- `src/storage`: snapshots/cache helpers

## Setup
```bash
cp .env.example .env
npm run build
```

## Run
```bash
npm run signal-engine
npm run trader
```

## Runtime channels
- Signals: `SIGNAL_CHANNEL_PATH` (`jsonl`, append-only)
- Runtime config: `RUNTIME_CONFIG_PATH` (atomic write+rename)
- State snapshot: `STATE_SNAPSHOT_PATH`

## Live trading
Only enabled when **both**:
- `DRY_RUN=false`
- `TRADING_ENABLED=true`

And credentials are set (`PRIVATE_KEY`, `CLOB_API_*`).

## Notes
This is a production-style scaffold with conservative defaults, not a profitability guarantee.
