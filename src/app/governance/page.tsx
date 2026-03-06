import { Metadata } from "next";
import { fetchProposals, fetchVotingProposals } from "@/lib/chain-api";
import { Section } from "@/components/section";
import { ProposalCard } from "@/components/proposal-card";

export const metadata: Metadata = {
  title: "Governance — PHOTON",
  description: "Live governance proposals from the AtomOne blockchain.",
};

export default async function GovernancePage() {
  const [proposals, votingProposals] = await Promise.all([
    fetchProposals(20),
    fetchVotingProposals(),
  ]);

  return (
    <Section
      tag="On-Chain Governance"
      title="Recent proposals"
      desc="Live from AtomOne governance. Every proposal shapes PHOTON's future."
      dark
    >
      {votingProposals.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-8">
          <span className="text-2xl">🗳️</span>
          <span className="text-sm text-text-primary">
            {votingProposals.length} proposal
            {votingProposals.length > 1 ? "s" : ""} in active voting — your
            voice matters
          </span>
        </div>
      )}

      {proposals.length === 0 ? (
        <p className="text-text-muted text-center py-12">
          No proposals found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-6 text-xs font-mono text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        From{" "}
        <a href="https://gov.atom.one/" target="_blank">
          AtomOne Governance
        </a>{" "}
        via <code>atomone/gov/v1</code>
      </div>
    </Section>
  );
}
