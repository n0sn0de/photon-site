import { Metadata } from "next";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Ecosystem — PHOTON",
  description:
    "Explore the AtomOne ecosystem: wallets, explorers, DEXs, governance tools, community channels, and developer resources for PHOTON and ATONE.",
};

interface EcosystemItem {
  name: string;
  desc: string;
  url: string;
  tag: string;
  tagColor: string;
}

const WALLETS: EcosystemItem[] = [
  {
    name: "Keplr Wallet",
    desc: "The leading wallet for the Cosmos ecosystem. Manage ATONE and PHOTON tokens, stake, and vote on governance.",
    url: "https://www.keplr.app/",
    tag: "Wallet",
    tagColor: "accent",
  },
  {
    name: "Leap Wallet",
    desc: "A secure and user-friendly wallet and block explorer for Cosmos-based chains including AtomOne.",
    url: "https://www.leapwallet.io/",
    tag: "Wallet",
    tagColor: "accent",
  },
  {
    name: "Cosmostation",
    desc: "Non-custodial super wallet for the Cosmos ecosystem with seamless cross-chain support for ATONE and PHOTON.",
    url: "https://www.cosmostation.io/",
    tag: "Wallet",
    tagColor: "accent",
  },
];

const EXPLORERS: EcosystemItem[] = [
  {
    name: "Mintscan",
    desc: "Block explorer and analytics platform by Cosmostation. View transactions, validators, proposals, and token supply.",
    url: "https://www.mintscan.io/atomone",
    tag: "Explorer",
    tagColor: "success",
  },
  {
    name: "Ping.pub",
    desc: "Open-source block explorer and web wallet with validator dashboards and governance tracking.",
    url: "https://ping.pub/atomone",
    tag: "Explorer",
    tagColor: "success",
  },
  {
    name: "Nodes Hub Explorer",
    desc: "Community explorer with staking analytics, validator performance, and chain health monitoring.",
    url: "https://explorer.nodeshub.online/atomone/staking",
    tag: "Explorer",
    tagColor: "success",
  },
  {
    name: "ATOMScan",
    desc: "Blockchain explorer with detailed parameter views, transaction search, and account analytics.",
    url: "https://atomscan.com/frontier/atomone",
    tag: "Explorer",
    tagColor: "success",
  },
  {
    name: "Explorer.ist",
    desc: "Multi-chain explorer supporting 120+ blockchains. Track AtomOne transactions and stake tokens.",
    url: "https://explorer.ist/atomone",
    tag: "Explorer",
    tagColor: "success",
  },
  {
    name: "Staking Explorer",
    desc: "Search transactions by hash, explore accounts, and view on-chain metrics like inflation and staking APR.",
    url: "https://staking-explorer.com/explorer/atomone",
    tag: "Explorer",
    tagColor: "success",
  },
];

const DEFI: EcosystemItem[] = [
  {
    name: "Osmosis DEX",
    desc: "The primary decentralized exchange for trading PHOTON and ATONE. Provides liquidity pools, swaps, and IBC transfers.",
    url: "https://app.osmosis.zone/?from=ATONE&to=PHOTON",
    tag: "DEX",
    tagColor: "warning",
  },
  {
    name: "GeckoTerminal",
    desc: "Real-time DEX analytics and price charts for ATONE and PHOTON tokens across Osmosis pools.",
    url: "https://www.geckoterminal.com/osmosis/pools",
    tag: "Analytics",
    tagColor: "warning",
  },
  {
    name: "CoinGecko — PHOTON",
    desc: "Market data, price history, trading volume, and token information for Photon.",
    url: "https://www.coingecko.com/en/coins/photon-2",
    tag: "Market Data",
    tagColor: "warning",
  },
  {
    name: "CoinGecko — ATONE",
    desc: "Market data, price history, and trading information for the ATONE staking token.",
    url: "https://www.coingecko.com/en/coins/atomone",
    tag: "Market Data",
    tagColor: "warning",
  },
];

const GOVERNANCE: EcosystemItem[] = [
  {
    name: "AtomOne Governance dApp",
    desc: "Create proposals, deposit on active ones, and cast your vote to shape the future of AtomOne.",
    url: "https://gov.atom.one/",
    tag: "Governance",
    tagColor: "atone",
  },
  {
    name: "AtomOne Staking dApp",
    desc: "Stake your ATONE tokens, earn rewards, and help secure the AtomOne network.",
    url: "https://staking.atom.one/",
    tag: "Staking",
    tagColor: "atone",
  },
  {
    name: "Nodeist Mint Tool",
    desc: "Community-built tool for minting PHOTON by burning ATONE. Simple UI, connect Keplr and go.",
    url: "https://atomone.ist/mainnet/mint",
    tag: "Mint Tool",
    tagColor: "accent",
  },
];

const COMMUNITY: EcosystemItem[] = [
  {
    name: "AtomOne Telegram",
    desc: "The main community channel. Discuss governance, development, and ecosystem updates.",
    url: "https://t.me/youwillatone",
    tag: "Chat",
    tagColor: "accent",
  },
  {
    name: "AtomOne Twitter/X",
    desc: "Official announcements, governance updates, and ecosystem news.",
    url: "https://x.com/_atomone",
    tag: "Social",
    tagColor: "accent",
  },
  {
    name: "AtomOne GitHub",
    desc: "Source code, constitution, genesis files, and all protocol development.",
    url: "https://github.com/atomone-hub",
    tag: "Code",
    tagColor: "accent",
  },
  {
    name: "AtomOne Documentation",
    desc: "Official docs covering architecture, governance, tokenomics, and technical guides.",
    url: "https://docs.atom.one/",
    tag: "Docs",
    tagColor: "accent",
  },
  {
    name: "Constitution",
    desc: "The foundational document governing AtomOne. Article 3, Section 5 defines PHOTON's role.",
    url: "https://github.com/atomone-hub/genesis/blob/main/CONSTITUTION.md",
    tag: "Foundation",
    tagColor: "accent",
  },
];

const DEVELOPER: EcosystemItem[] = [
  {
    name: "AtomOne RPC (NosNode)",
    desc: "Public RPC endpoint operated by NosNode. No rate limits. https://atomone-rpc.nosnode.com/",
    url: "https://atomone-rpc.nosnode.com/",
    tag: "RPC",
    tagColor: "accent",
  },
  {
    name: "AtomOne LCD (NosNode)",
    desc: "Public REST/LCD endpoint for querying chain state. https://atomone-lcd.nosnode.com/",
    url: "https://atomone-lcd.nosnode.com/",
    tag: "API",
    tagColor: "accent",
  },
  {
    name: "atomoned CLI",
    desc: "The official command-line interface for interacting with the AtomOne blockchain.",
    url: "https://github.com/atomone-hub/atomone",
    tag: "CLI",
    tagColor: "accent",
  },
  {
    name: "Dither Protocol",
    desc: "Read-optimized, event-sourced messaging protocol building on AtomOne.",
    url: "https://dither.chat/",
    tag: "Protocol",
    tagColor: "accent",
  },
];

function EcosystemGrid({ items }: { items: EcosystemItem[] }) {
  const colorMap: Record<string, string> = {
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    atone: "bg-atone/10 text-atone",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-bg-card rounded-xl border border-border p-5 transition-all hover:border-accent/30 hover:bg-bg-card-hover no-underline block"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
              {item.name}
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap ${
                colorMap[item.tagColor] || colorMap.accent
              }`}
            >
              {item.tag}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {item.desc}
          </p>
          <div className="mt-3 text-xs font-mono text-text-muted group-hover:text-accent/60 transition-colors">
            {new URL(item.url).hostname} →
          </div>
        </a>
      ))}
    </div>
  );
}

export default function EcosystemPage() {
  return (
    <>
      <Section
        tag="Ecosystem"
        title="AtomOne ecosystem"
        desc="Everything you need to explore, trade, stake, and build with PHOTON and ATONE."
      >
        <h3 className="text-sm font-mono text-accent mb-4 uppercase tracking-wider">
          Wallets
        </h3>
        <EcosystemGrid items={WALLETS} />
      </Section>

      <Section tag="Explore" title="Block explorers" desc="Track transactions, monitor validators, and analyze on-chain activity." dark>
        <EcosystemGrid items={EXPLORERS} />
      </Section>

      <Section tag="Trade" title="DeFi & markets" desc="Trade PHOTON and ATONE on decentralized exchanges and track market data.">
        <EcosystemGrid items={DEFI} />
      </Section>

      <Section tag="Participate" title="Governance & staking" desc="Stake, vote, and mint PHOTON to participate in the AtomOne network." dark>
        <EcosystemGrid items={GOVERNANCE} />
      </Section>

      <Section tag="Connect" title="Community" desc="Join the conversation and stay updated on AtomOne's development.">
        <EcosystemGrid items={COMMUNITY} />
      </Section>

      <Section tag="Build" title="Developer resources" desc="Endpoints, tools, and protocols for building on AtomOne." dark>
        <EcosystemGrid items={DEVELOPER} />
        <div className="mt-8 bg-bg-card rounded-xl border border-accent/20 p-6">
          <h4 className="font-medium text-text-primary mb-2">
            🏗️ Building on AtomOne?
          </h4>
          <p className="text-sm text-text-secondary">
            AtomOne welcomes community contributions. Add your app to the{" "}
            <a
              href="https://github.com/atomone-hub/atom.one/blob/main/content/english/ecosystem/apps/data.json"
              target="_blank"
            >
              official ecosystem directory
            </a>{" "}
            or submit a PR to the{" "}
            <a href="https://github.com/atomone-hub/atomone" target="_blank">
              atomone repository
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
