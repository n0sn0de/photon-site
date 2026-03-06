import { Metadata } from "next";
import { fetchValidators } from "@/lib/chain-api";
import { Section } from "@/components/section";
import { ValidatorRow } from "@/components/validator-row";
import { calcNakamotoCoefficient } from "@/lib/utils";
import { formatCompact, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Validators — PHOTON",
  description: "AtomOne validator leaderboard — voting power, commission rates, and Nakamoto coefficient.",
};

export default async function ValidatorsPage() {
  const validators = await fetchValidators(100);
  const top20 = validators.slice(0, 20);

  const totalBonded = validators.reduce(
    (sum, v) => sum + parseInt(v.tokens),
    0
  );
  const totalCount = validators.length;

  const tokensList = validators.map((v) => parseInt(v.tokens));
  const nakamoto = calcNakamotoCoefficient(tokensList);
  const maxTokens = top20.length > 0 ? parseInt(top20[0].tokens) : 1;

  return (
    <Section
      tag="Network Security"
      title="Validator leaderboard"
      desc="The top validators securing AtomOne. Voting power distribution matters — decentralization is a feature, not a bug."
    >
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-xl md:text-2xl font-mono font-medium text-text-primary">
            {formatCompact(totalBonded / 1e6)} ATONE
          </div>
          <div className="text-xs font-mono text-text-muted mt-1">
            Total Bonded
          </div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-xl md:text-2xl font-mono font-medium text-text-primary">
            {totalCount}
          </div>
          <div className="text-xs font-mono text-text-muted mt-1">
            Active Validators
          </div>
        </div>
        <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-xl md:text-2xl font-mono font-medium text-accent">
            {nakamoto}
          </div>
          <div className="text-xs font-mono text-text-muted mt-1">
            Nakamoto Coefficient
          </div>
        </div>
      </div>

      {/* Validator table */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_6rem_1fr_4rem] md:grid-cols-[3rem_1fr_8rem_1fr_5rem] gap-2 md:gap-4 py-3 px-3 md:px-4 border-b border-border text-xs font-mono text-text-muted uppercase tracking-wider">
          <span className="text-center">#</span>
          <span>Validator</span>
          <span className="text-right">Bonded ATONE</span>
          <span>Voting Power</span>
          <span className="text-right">Comm.</span>
        </div>

        {/* Rows */}
        {top20.map((v, i) => (
          <ValidatorRow
            key={v.operator_address}
            rank={i + 1}
            moniker={v.description?.moniker || "Unknown"}
            website={v.description?.website || ""}
            tokens={parseInt(v.tokens)}
            totalBonded={totalBonded}
            maxTokens={maxTokens}
            commission={
              parseFloat(v.commission?.commission_rates?.rate || "0") * 100
            }
            operatorAddress={v.operator_address}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-6 text-xs font-mono text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Live from{" "}
        <a href="https://atomone-lcd.nosnode.com/swagger/" target="_blank">
          NosNode LCD
        </a>{" "}
        — top 20 by voting power
      </div>
    </Section>
  );
}
