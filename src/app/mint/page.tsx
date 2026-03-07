import { Metadata } from "next";
import { fetchConversionRate } from "@/lib/chain-api";
import { Section } from "@/components/section";
import { MintSection } from "./mint-section";

export const metadata: Metadata = {
  title: "Mint PHOTON — Burn ATONE On-Chain",
  description: "Connect your Keplr or Leap wallet and mint PHOTON by burning ATONE directly on the AtomOne blockchain.",
};

export default async function MintPage() {
  const conversionRate = await fetchConversionRate();

  return (
    <>
      <Section
        tag="Mint"
        title="Mint PHOTON on-chain"
        desc="Connect your wallet, burn ATONE, and receive freshly minted PHOTON. The MsgMintPhoton transaction is fee-exempt."
      >
        <MintSection conversionRate={conversionRate} />
      </Section>

      {/* Alternative methods */}
      <Section
        tag="Guide"
        title="Other ways to mint"
        desc="Three ways to convert your ATONE into PHOTON. Pick the one that fits your comfort level."
        dark
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/20 text-success">
                Easiest
              </span>
            </div>
            <h3 className="font-medium text-text-primary mb-2">
              Nodeist Mint Tool
            </h3>
            <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
              <li>
                Go to{" "}
                <a href="https://atomone.ist/mainnet/mint" target="_blank">
                  atomone.ist/mainnet/mint
                </a>
              </li>
              <li>Connect your Keplr wallet</li>
              <li>Enter ATONE amount to burn</li>
              <li>Review and click Mint</li>
            </ol>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent/20 text-accent">
                Official
              </span>
            </div>
            <h3 className="font-medium text-text-primary mb-2">
              AtomOne Staking dApp
            </h3>
            <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
              <li>
                Visit{" "}
                <a href="https://staking.atom.one/" target="_blank">
                  staking.atom.one
                </a>
              </li>
              <li>Connect your wallet</li>
              <li>Navigate to mint/burn section</li>
              <li>Confirm the burn</li>
            </ol>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-danger/20 text-danger">
                Advanced
              </span>
            </div>
            <h3 className="font-medium text-text-primary mb-2">
              CLI (Power Users)
            </h3>
            <div className="bg-bg-elevated rounded-lg p-3 font-mono text-xs text-text-secondary overflow-x-auto">
              <pre>{`atomoned tx photon mint-photon \\
  100000000uatone \\
  --from mykey \\
  --chain-id atomone-1 \\
  --node https://atomone-rpc.nosnode.com:443 \\
  --fees 0uphoton`}</pre>
            </div>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h4 className="font-medium text-text-primary mb-2">
            💱 Don&apos;t want to burn ATONE?
          </h4>
          <p className="text-sm text-text-secondary">
            You can also{" "}
            <strong className="text-text-primary">buy PHOTON directly</strong>{" "}
            on{" "}
            <a
              href="https://app.osmosis.zone/?from=ATONE&to=PHOTON"
              target="_blank"
            >
              Osmosis DEX
            </a>
            . Check the{" "}
            <a href="/data#arbitrage">Mint vs Buy</a> section to see which
            option is cheaper right now.
          </p>
        </div>
      </Section>
    </>
  );
}
