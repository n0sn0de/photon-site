import { fetchAllChainData } from "@/lib/chain-api";
import { fetchPrices } from "@/lib/coingecko";
import { microToToken } from "@/lib/format";
import { StakingCalculator } from "@/components/staking-calculator";

export const metadata = {
  title: "Staking Calculator — PHOTON",
  description:
    "Calculate ATONE staking rewards on AtomOne. See APR, APY, compounding projections, and validator commission impact with live chain data.",
};

export default async function StakingPage() {
  const [chainData, prices] = await Promise.all([
    fetchAllChainData(),
    fetchPrices(),
  ]);

  const totalSupply = chainData.supply
    ? microToToken(chainData.supply.atoneSupply)
    : 136_800_995;
  const bondedTokens = chainData.pool
    ? microToToken(chainData.pool.bondedTokens)
    : 53_533_915;
  const bondedRatio = bondedTokens / totalSupply;

  // AtomOne inflation is currently fixed at 20%
  const inflation = 0.20;
  const communityTax = 0.05;

  return (
    <section className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono uppercase tracking-widest mb-4">
            Calculator
          </span>
          <h1 className="text-3xl md:text-5xl font-display text-text-primary mb-4">
            Staking <span className="text-accent italic">Rewards</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Estimate your ATONE staking rewards with live chain parameters.
            Adjust commission, duration, and compounding to project your returns.
          </p>
        </div>

        <StakingCalculator
          inflation={inflation}
          bondedRatio={bondedRatio}
          communityTax={communityTax}
          atoneUsd={prices.atoneUsd}
          bondedTokens={bondedTokens}
          totalSupply={totalSupply}
        />
      </div>
    </section>
  );
}
