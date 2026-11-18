# Covenant Floor · Canton

Same floor as the Supra product. Native to Canton: Daml contracts, parties, and the CIP-103 wallet. Not an EVM port.

This repository is **not deployed** to Canton mainnet.

| Item | Status |
|---|---|
| Application party | Not created |
| Funding party | Not created |
| Token | Not deployed |
| Random games | Not live. No verified Canton dVRF |
| Pay Desk | Rules tested off ledger. Contract not compiled or deployed |
| Telegram bot | Alert-only. Idle until a ledger is configured |
| Website | Not in production |

Do not send Canton Coin until a party id of the form `hint::fingerprint` has been allocated on a mainnet participant and shown here.

## Layout

- `daml/` — contract model. Not compiled in this environment (`dpm` is not installed).
- `src/paydesk.mjs` — Pay Desk rules. `npm test` runs them.
- `bot/` — Telegram alerts. It cannot sign or move funds.
- `frontend/` — the floor UI. Balances stay "Not deployed" until a wallet and a ledger return them.

## Commands

```bash
npm test
npm run dev
```

Production must set `CANTON_NETWORK=mainnet` and must fail closed when `CANTON_LEDGER_URL` or `CANTON_APP_PARTY` is empty. See `.env.example`.
