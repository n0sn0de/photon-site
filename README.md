# PHOTON — The Fee Token of AtomOne

A Next.js 14 web application providing real-time data, education, and wallet integration for the PHOTON fee token on the AtomOne blockchain.

## Features

- **Live Chain Data** — SSR-cached supply, staking pool, conversion rate, and block info via NosNode LCD endpoints
- **Mint vs Buy Arbitrage** — Real-time comparison of minting cost (burning ATONE) vs market price on Osmosis DEX
- **Conversion Calculator** — Interactive tool to estimate PHOTON received for a given ATONE burn amount
- **Governance Dashboard** — Live proposals from `atomone/gov/v1` with vote tally bars and status badges
- **Validator Leaderboard** — Top validators by voting power with Nakamoto coefficient calculation
- **Community Treasury** — Pool balances with USD estimates from CoinGecko
- **Wallet Integration** — Connect Keplr or Leap to mint PHOTON directly via `MsgMintPhoton`
- **Token Mechanics** — Educational content on the dual-token model, constitution, dynamic fees, and Nakamoto bonus
- **FAQ** — Accordion with common PHOTON questions

## Tech Stack

- **Framework:** Next.js 14 (App Router, SSR with `revalidate`)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** vitest + @testing-library/react + @testing-library/jest-dom
- **Wallet:** CosmJS (@cosmjs/stargate) + Keplr/Leap direct integration
- **Data Sources:** AtomOne LCD (NosNode), CoinGecko API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
```

## Build

```bash
npm run build
npm start
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero + live stats summary |
| `/data` | Full dashboard with arbitrage indicator + calculator |
| `/mechanics` | Dual-token model, constitution, dynamic fees, Nakamoto bonus |
| `/governance` | Live proposals with vote tallies |
| `/validators` | Validator leaderboard + Nakamoto coefficient |
| `/treasury` | Community pool balances |
| `/mint` | Wallet connection + on-chain PHOTON minting |
| `/faq` | FAQ accordion |

## API Endpoints

- LCD: `https://atomone-lcd.nosnode.com`
- RPC: `https://atomone-rpc.nosnode.com`
- Chain: `atomone-1`

## License

MIT

---

Chain data via [NosNode](https://nosnode.com). Built by [n0sn0de](https://github.com/n0sn0de).
