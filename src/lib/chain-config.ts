import { CHAIN_ID, BECH32_PREFIX, RPC_BASE, PHOTON_DENOM, ATONE_DENOM } from "./constants";

export const atomoneChainInfo = {
  chainId: CHAIN_ID,
  chainName: "AtomOne",
  rpc: RPC_BASE,
  rest: "https://atomone-lcd.nosnode.com",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: BECH32_PREFIX,
    bech32PrefixAccPub: `${BECH32_PREFIX}pub`,
    bech32PrefixValAddr: `${BECH32_PREFIX}valoper`,
    bech32PrefixValPub: `${BECH32_PREFIX}valoperpub`,
    bech32PrefixConsAddr: `${BECH32_PREFIX}valcons`,
    bech32PrefixConsPub: `${BECH32_PREFIX}valconspub`,
  },
  currencies: [
    { coinDenom: "ATONE", coinMinimalDenom: ATONE_DENOM, coinDecimals: 6 },
    { coinDenom: "PHOTON", coinMinimalDenom: PHOTON_DENOM, coinDecimals: 6 },
  ],
  feeCurrencies: [
    {
      coinDenom: "PHOTON",
      coinMinimalDenom: PHOTON_DENOM,
      coinDecimals: 6,
      gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },
    },
  ],
  stakeCurrency: {
    coinDenom: "ATONE",
    coinMinimalDenom: ATONE_DENOM,
    coinDecimals: 6,
  },
};

export const MSG_MINT_PHOTON_TYPE = "/atomone.photon.v1.MsgMintPhoton";
