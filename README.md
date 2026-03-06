# ◎ PHOTON — The Fee Token of AtomOne

The definitive resource for **Photon**, the dedicated fee token of the [AtomOne](https://atom.one) blockchain's dual-token model.

## What Is This?

A single-page website covering everything about Photon:

- **Live Chain Data** — Real-time supply, conversion rate, staking stats pulled from [NosNode](https://nosnode.com) LCD endpoints
- **Token Mechanics** — How the ATONE → PHOTON one-way burn works, the math behind the conversion rate
- **Dual Token Model** — Why separating staking from fees matters for IBC hub security
- **Burn Calculator** — Interactive tool to estimate PHOTON received for burning ATONE
- **Origin Story** — Timeline from the 2019 Cosmos multi-token proposal to AtomOne's launch
- **Ecosystem Resources** — Links to governance, staking, explorers, and community

## Tech Stack

Zero build step. Pure HTML/CSS/JS.

- **Fonts:** Instrument Serif, Manrope, DM Mono
- **Data:** AtomOne LCD API via `atomone-lcd.nosnode.com`
- **Design:** Dark cosmos aesthetic with photon amber/gold accents

## Run Locally

```bash
# Any static file server works
python3 -m http.server 8080
# or
npx serve .
```

## Deploy

Drop the files on any static host — Vercel, Netlify, GitHub Pages, Caddy, Nginx, whatever.

## Data Endpoints

All data comes from NosNode's AtomOne infrastructure:

| Endpoint | Data |
|----------|------|
| `/cosmos/bank/v1beta1/supply` | ATONE + PHOTON supply |
| `/atomone/photon/v1/conversion_rate` | Current burn rate |
| `/cosmos/staking/v1beta1/pool` | Bonded/unbonded tokens |
| `/cosmos/staking/v1beta1/validators` | Active validator count |

## License

MIT — Built by [n0sn0de](https://github.com/n0sn0de)
