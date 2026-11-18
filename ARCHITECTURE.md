# Architecture

Studied the Supra floor (`covenant::floor`), its React shell, and the alert bot before this repository was opened. The Supra package, Move multisig, and StarKey flow are not imported.

## Reused

- Product rules: game pays, Pay Desk timing, separate house / player / prize / stake / escrow purposes, sidebar, felt tables, green-on-black floor.
- Alert kinds and the rule that the bot only talks. It does not hold keys.

## Rewritten for Canton

- Identity is a **party** (`hint::fingerprint`), hosted by a participant, not an `0x` address.
- Value is a **Token Standard holding** (UTXO contract). CIP-0112 (V2) is the current standard. CIP-0056 is the older one. Canton Coin is the Splice instrument `Amulet`, spent as traffic, not as an ERC-20.
- Wallets use **@canton-network/dapp-sdk 1.10.0** (CIP-103): discovery, `connect()`, party listing, and user-signed `prepareExecute`.
- Authorization is **signatory / controller / observer**. The Pay Desk poster is the only signatory of the job. The operator is an observer and has no choice that moves the reward.
- A house withdrawal is a two-party proposal and cannot name a player holding or a Pay Desk escrow. This is not the Supra 2-of-3.

## Cannot be reproduced yet

- **Randomness.** No official Canton dVRF was found. Kaiko publishes price oracles, not game randomness. Random tables abort. They are not mainnet games.
- **A public dashboard of other players.** Canton shows a party only the contracts it is entitled to see. Those metrics stay "Private" or "Not deployed". They are not filled in.
- **Compiling the DAR here.** `dpm` is not installed, so the Daml is source only.
- **Allocating a funding party here.** An external party exists only after topology is submitted to a participant on the Global Synchronizer. An offline key is not an address you can pay. No party was created, and no key is stored in this repo.

## Token name

`CANTONK` was the candidate. A directory search did not show that symbol on CantonScan's public token board. It is **not confirmed and not deployed**. The UI says "Not deployed".

## What the operator can do, once deployed

| Action | Who |
|---|---|
| Pause a pool | Application operator. Pause does not transfer value. |
| Propose a house withdrawal | Operator, and a second application party must agree. |
| Pay or return a job | The poster only. |
| Close a job after 48 hours of silence | Any party. The worker is paid. |
| Configure a token | Not granted. No token package is wired. |
| Move a player holding | Nobody except that player's wallet. |

There is no backend route that submits as the user.
