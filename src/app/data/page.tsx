import { Metadata } from "next";
import { fetchAllChainData } from "@/lib/chain-api";
import { fetchPrices } from "@/lib/coingecko";
import { fetchPhotonPools, fetchPhotonPrice } from "@/lib/osmosis-api";
import { Section } from "@/components/section";
import { StatCard } from "@/components/stat-card";
import { OsmosisPools } from "@/components/osmosis-pools";
import {
  formatNumber,
  formatCompact,
  formatUsd,
  formatPct,
  microToToken,
  photonMintedPct,
  calcMintCost,
  calcArbitragePct,
  estimateAtoneBurned,
} from "@/lib/format";
import { PHOTON_MAX_SUPPLY } from "@/lib/constants";
import { ConversionCalculator } from "./calculator";
import { ArbitrageSection } from "./arbitrage";

export const metadata: Metadata = {
  title: "Live Data — PHOTON",
  description: "Real-time PHOTON chain data, supply breakdown, prices, and arbitrage indicators.",
};

export default async function DataPage() {
  const [chainData, prices, osmosisPools, photonOsmosisPrice] = await Promise.all([
    fetchAllChainData(),
    fetchPrices(),
    fetchPhotonPools(),
    fetchPhotonPrice(),
  ]);

  const photonSupplyMicro = chainData.supply?.photonSupply || "0";
  const atoneSupplyMicro = chainData.supply?.atoneSupply || "0";
  const photonSupply = microToToken(photonSupplyMicro);
  const atoneSupply = microToToken(atoneSupplyMicro);
  const rate = chainData.conversionRate || 0;
  const bondedTokens = chainData.pool
    ? microToToken(chainData.pool.bondedTokens)
    : 0;
  const bondedPct = atoneSupply > 0 ? (bondedTokens / atoneSupply) * 100 : 0;
  const mintedPct = photonMintedPct(photonSupplyMicro);
  const burned = estimateAtoneBurned(photonSupplyMicro, rate);

  const mintCost =
    prices.atoneUsd && rate ? calcMintCost(prices.atoneUsd, rate) : null;
  const arbPct =
    mintCost && prices.photonUsd
      ? calcArbitragePct(mintCost, prices.photonUsd)
      : null;

  return (
    <>
      <Section
        tag="Live Chain Data"
        title="Real-time Photon metrics"
        desc="Pulled directly from AtomOne's blockchain via NosNode RPC endpoints. No intermediaries."
        id="live-data"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon="◎"
            title="PHOTON Supply"
            value={formatNumber(photonSupply)}
            sub={`of ${formatNumber(PHOTON_MAX_SUPPLY)} max supply`}
            progress={mintedPct}
            footer={`${formatPct(mintedPct)} minted`}
            tokenIcon="photon"
            featured
          />
          <StatCard
            icon="⬡"
            title="ATONE Supply"
            value={formatNumber(atoneSupply)}
            sub="Total circulating"
            tokenIcon="atone"
          />
          <StatCard
            icon="⚡"
            title="Conversion Rate"
            value={rate.toFixed(6)}
            sub="PHOTON per ATONE burned"
          />
          <StatCard
            icon="🔥"
            title="ATONE Burned"
            value={"~" + formatNumber(Math.round(burned))}
            sub="Permanently removed"
          />
          <StatCard
            icon="🔒"
            title="Bonded ATONE"
            value={formatNumber(bondedTokens)}
            sub={`${formatPct(bondedPct)} of total supply staked`}
          />
          <StatCard
            icon="💰"
            title="PHOTON Price"
            value={formatUsd(prices.photonUsd)}
            sub={
              prices.photon24hChange !== null
                ? `${prices.photon24hChange >= 0 ? "+" : ""}${prices.photon24hChange.toFixed(2)}% 24h`
                : undefined
            }
          />
        </div>

        <div className="flex items-center gap-2 mt-6 text-xs font-mono text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Data from{" "}
          <a
            href="https://atomone-lcd.nosnode.com/swagger/"
            target="_blank"
          >
            NosNode LCD
          </a>{" "}
          — refreshes every 30s
        </div>
      </Section>

      <ArbitrageSection
        mintCost={mintCost}
        buyCost={prices.photonUsd}
        atoneUsd={prices.atoneUsd}
        rate={rate}
        photon24hChange={prices.photon24hChange}
        photonMcap={prices.photonMcap}
        arbPct={arbPct}
      />

      <Section
        tag="Osmosis DEX"
        title="PHOTON on Osmosis"
        desc="PHOTON liquidity pools on Osmosis DEX. Trade, LP, or provide concentrated liquidity."
        id="osmosis-pools"
        dark
      >
        <OsmosisPools pools={osmosisPools} photonOsmosisPrice={photonOsmosisPrice} />
      </Section>

      <ConversionCalculator rate={rate} />
    </>
  );
}
