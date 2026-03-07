import { fetchAllChainData } from "@/lib/chain-api";
import { fetchPrices } from "@/lib/coingecko";
import { microToToken } from "@/lib/format";
import { SimulatorClient } from "@/components/simulator-client";

export const metadata = {
  title: "Conversion Simulator — PHOTON",
  description:
    "Interactive simulator showing how the ATONE→PHOTON conversion rate changes as supply grows. Visualize the conversion curve, calculate minting costs, and explore rate milestones.",
};

export default async function SimulatorPage() {
  const [chainData, prices] = await Promise.all([
    fetchAllChainData(),
    fetchPrices(),
  ]);

  const photonSupply = chainData.supply
    ? microToToken(chainData.supply.photonSupply)
    : 73_795_684;
  const atoneSupply = chainData.supply
    ? microToToken(chainData.supply.atoneSupply)
    : 136_800_995;
  const rate = chainData.conversionRate ?? 6.77;

  return (
    <section className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono uppercase tracking-widest mb-4">
            Interactive Tool
          </span>
          <h1 className="text-3xl md:text-5xl font-display text-text-primary mb-4">
            Conversion <span className="text-accent italic">Simulator</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Explore the ATONE→PHOTON conversion dynamics. See how the rate changes as
            supply grows, calculate your mint output, and compare minting vs buying.
          </p>
        </div>

        <SimulatorClient
          currentPhotonSupply={photonSupply}
          atoneSupply={atoneSupply}
          currentRate={rate}
          atoneUsd={prices.atoneUsd}
          photonUsd={prices.photonUsd}
        />
      </div>
    </section>
  );
}
