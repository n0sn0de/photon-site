# PHOTON — The Fee Token of AtomOne

A comprehensive resource site for Photon, the dedicated fee token of the AtomOne blockchain's dual-token model.

🌐 **Live:** [n0sn0de.github.io/photon-site](https://n0sn0de.github.io/photon-site/)

## Features

- **Live Chain Data** — Real-time supply, conversion rate, bonded ATONE, validators (via NosNode LCD)
- **Mint vs Buy Arbitrage** — Live comparison of minting cost vs Osmosis DEX market price
- **Conversion Rate Simulator** — Interactive chart showing rate decay over time with adjustable parameters
- **Source Code Explainer** — Annotated Go code from the `x/photon` module
- **Constitution Section** — Article 3, Section 5 excerpt on PHOTON's constitutional mandate
- **Governance History** — Live proposals from `atomone/gov/v1` with vote tallies
- **Validator Leaderboard** — Top 20 validators by voting power with Nakamoto coefficient
- **Community Treasury** — Live pool balances with USD estimates
- **Dynamic Fee Module** — AIMD EIP-1559 mechanism explainer
- **Nakamoto Bonus** — Decentralization incentive explanation
- **How to Mint Guide** — Step-by-step for GUI, dApp, and CLI
- **FAQ** — 10 common questions with accordion UI
- **Burn Calculator** — Instant ATONE → PHOTON conversion estimate
- **Chain Status Bar** — Live block height, chain-id, block time

## Stack

Pure HTML/CSS/JS — zero build step, zero dependencies.

- **Design:** Dark cosmos aesthetic with amber/gold photon energy accents
- **Typography:** Instrument Serif + Manrope + DM Mono
- **Data:** NosNode LCD endpoints (our infra, no rate limits) + CoinGecko API
- **Performance:** Lazy-loaded API sections, IntersectionObserver animations
- **Accessibility:** Skip-to-content, ARIA labels, keyboard navigation, focus-visible

## Deployment

Deployed automatically via GitHub Pages on push to `main`.

## Data Sources

| Data | Source |
|------|--------|
| Chain supply, staking, validators | [NosNode LCD](https://atomone-lcd.nosnode.com/swagger/) |
| Conversion rate | `atomone/photon/v1/conversion_rate` |
| Governance proposals | `atomone/gov/v1/proposals` |
| Price data | [CoinGecko API](https://www.coingecko.com/) |
| Block info | `cosmos/base/tendermint/v1beta1/blocks/latest` |

## Built by

[n0sn0de](https://github.com/n0sn0de) — an independent community resource. Not affiliated with All in Bits or AtomOne governance.
