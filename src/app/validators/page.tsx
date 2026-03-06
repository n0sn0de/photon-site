import { Metadata } from "next";
import { fetchValidators } from "@/lib/chain-api";
import { Section } from "@/components/section";
import { ValidatorRow } from "@/components/validator-row";
import { calcNakamotoCoefficient } from "@/lib/utils";
import { formatCompact, formatNumber, formatPct } from "@/lib/format";

export const metadata: Metadata = {
  title: "Validators — PHOTON",
  description: "AtomOne validator leaderboard — voting power, commission rates, and Nakamoto coefficient.",
};

const NOSNODE_VALOPER = "atonevaloper10jm8fvdyqlj78w0j5nawc76wsn4pqmdxkny2gd";

export default async function ValidatorsPage() {
  const validators = await fetchValidators(200);
  const top20 = validators.slice(0, 20);

  const totalBonded = validators.reduce(
    (sum, v) => sum + parseInt(v.tokens),
    0
  );
  const totalCount = validators.length;

  const tokensList = validators.map((v) => parseInt(v.tokens));
  const nakamoto = calcNakamotoCoefficient(tokensList);
  const maxTokens = top20.length > 0 ? parseInt(top20[0].tokens) : 1;

  // Find NosNode validator
  const nosNodeIndex = validators.findIndex(
    (v) => v.operator_address === NOSNODE_VALOPER
  );
  const nosNode = nosNodeIndex >= 0 ? validators[nosNodeIndex] : null;
  const nosNodeRank = nosNodeIndex >= 0 ? nosNodeIndex + 1 : null;
  const nosNodeTokens = nosNode ? parseInt(nosNode.tokens) : 0;
  const nosNodeCommission = nosNode
    ? parseFloat(nosNode.commission?.commission_rates?.rate || "0") * 100
    : 5;
  const nosNodePowerPct = totalBonded > 0 ? (nosNodeTokens / totalBonded) * 100 : 0;

  return (
    <Section
      tag="Network Security"
      title="Validator leaderboard"
      desc="The top validators securing AtomOne. Voting power distribution matters — decentralization is a feature, not a bug."
    >
      {/* NosNode Highlight */}
      {nosNode && (
        <div className="mb-8 relative">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-accent/30 via-accent/10 to-accent/30 blur-sm" />
          <div className="relative bg-bg-card rounded-xl border border-accent/30 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-2xl">
                  🔮
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-medium text-text-primary">
                      NosNode🔮
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      #{nosNodeRank}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-mono">
                    Securing AtomOne since genesis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-mono font-medium text-text-primary">
                    {formatNumber(nosNodeTokens / 1e6, 0)}
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    <img src="/assets/atone.svg" alt="ATONE" className="w-3 h-3 inline mr-1" />
                    Delegated
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono font-medium text-text-primary">
                    {nosNodeCommission.toFixed(0)}%
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    Commission
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-mono font-medium text-text-primary">
                    {formatPct(nosNodePowerPct, 2)}
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    Voting Power
                  </div>
                </div>
              </div>

              <a
                href={`https://wallet.keplr.app/chains/atomone?modal=validator&chain=atomone-1&validator_address=${NOSNODE_VALOPER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-accent text-bg-primary font-mono font-medium text-sm hover:bg-accent-bright transition-colors no-underline whitespace-nowrap"
              >
                Delegate
              </a>
            </div>
          </div>
        </div>
      )}

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
