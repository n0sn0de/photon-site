import { Metadata } from "next";
import { fetchCommunityPool } from "@/lib/chain-api";
import { fetchPrices } from "@/lib/coingecko";
import { Section } from "@/components/section";
import { StatCard } from "@/components/stat-card";
import { formatNumber, formatCompact } from "@/lib/format";

export const metadata: Metadata = {
  title: "Treasury — PHOTON",
  description: "AtomOne community pool balances — ATONE and PHOTON with USD estimates.",
};

export default async function TreasuryPage() {
  const [pool, prices] = await Promise.all([
    fetchCommunityPool(),
    fetchPrices(),
  ]);

  const atoneUsd = pool.atone * (prices.atoneUsd || 0);
  const photonUsd = pool.photon * (prices.photonUsd || 0);
  const totalUsd = atoneUsd + photonUsd;

  return (
    <Section
      tag="Treasury"
      title="Community pool"
      desc="The on-chain treasury accumulates from transaction fees and inflation. Governance controls how it's spent."
      dark
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon="🏦"
          title="ATONE Balance"
          value={formatNumber(Math.round(pool.atone))}
          sub="Community pool ATONE"
          featured
        />
        <StatCard
          icon="◎"
          title="PHOTON Balance"
          value={formatNumber(Math.round(pool.photon))}
          sub="Community pool PHOTON"
        />
        <StatCard
          icon="💰"
          title="USD Value"
          value={totalUsd > 0 ? "$" + formatCompact(totalUsd) : "—"}
          sub="Estimated total value"
        />
      </div>

      <div className="bg-bg-card rounded-xl border border-border p-6">
        <p className="text-sm text-text-secondary leading-relaxed">
          The community pool funds ecosystem development, security audits, and
          chain improvements.{" "}
          <a href="https://gov.atom.one/proposals/14" target="_blank">
            Proposal #14
          </a>{" "}
          authorized minting PHOTON from the pool&apos;s ATONE — the first
          governance-directed use of the mint mechanism.
        </p>
      </div>
    </Section>
  );
}
