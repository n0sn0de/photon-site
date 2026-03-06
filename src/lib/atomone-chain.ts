// AtomOne chain and asset definitions for cosmos-kit
// Not in chain-registry yet, so we define them manually

export const atomoneChain = {
  $schema: "../chain.schema.json",
  chain_name: "atomone",
  chain_type: "cosmos",
  chain_id: "atomone-1",
  pretty_name: "AtomOne",
  status: "live",
  network_type: "mainnet",
  bech32_prefix: "atone",
  daemon_name: "atomoned",
  node_home: "$HOME/.atomone",
  key_algos: ["secp256k1"],
  slip44: 118,
  fees: {
    fee_tokens: [
      {
        denom: "uphoton",
        fixed_min_gas_price: 0.006,
        low_gas_price: 0.01,
        average_gas_price: 0.025,
        high_gas_price: 0.04,
      },
    ],
  },
  staking: {
    staking_tokens: [{ denom: "uatone" }],
  },
  apis: {
    rpc: [
      { address: "https://atomone-rpc.nosnode.com", provider: "NosNode" },
    ],
    rest: [
      { address: "https://atomone-lcd.nosnode.com", provider: "NosNode" },
    ],
  },
  explorers: [
    {
      kind: "mintscan",
      url: "https://www.mintscan.io/atomone",
      tx_page: "https://www.mintscan.io/atomone/tx/${txHash}",
    },
  ],
} as const;

export const atomoneAssets = {
  $schema: "../assetlist.schema.json",
  chain_name: "atomone",
  assets: [
    {
      description: "The staking token of AtomOne",
      type_asset: "sdk.coin" as const,
      denom_units: [
        { denom: "uatone", exponent: 0 },
        { denom: "atone", exponent: 6 },
      ],
      base: "uatone",
      name: "AtomOne",
      display: "atone",
      symbol: "ATONE",
      logo_URIs: {
        svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.svg",
        png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.png",
      },
    },
    {
      description: "The fee token of AtomOne",
      type_asset: "sdk.coin" as const,
      denom_units: [
        { denom: "uphoton", exponent: 0 },
        { denom: "photon", exponent: 6 },
      ],
      base: "uphoton",
      name: "Photon",
      display: "photon",
      symbol: "PHOTON",
      logo_URIs: {
        svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/photon.svg",
        png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/photon.png",
      },
    },
  ],
};
