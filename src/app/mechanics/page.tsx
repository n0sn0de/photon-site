import { Metadata } from "next";
import { Section } from "@/components/section";

export const metadata: Metadata = {
  title: "Mechanics — PHOTON",
  description: "How PHOTON works: the dual-token model, constitution, dynamic fees, and Nakamoto bonus.",
};

export default function MechanicsPage() {
  return (
    <>
      {/* Token Mechanics */}
      <Section
        tag="Token Mechanics"
        title="How Photon works"
        desc="A one-way burn mechanism ensures PHOTON's supply is forever tied to ATONE's sacrifice."
      >
        {/* Flow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            {
              num: "01",
              title: "Burn ATONE",
              desc: 'Users send ATONE to the burn address via MsgMintPhoton. This is irreversible — the ATONE is permanently destroyed.',
            },
            {
              num: "02",
              title: "Conversion Rate Applied",
              desc: "The protocol calculates: photon_minted = atone_burned × (max_supply − current_supply) / atone_supply. The rate naturally decreases over time.",
            },
            {
              num: "03",
              title: "Receive PHOTON",
              desc: "Fresh PHOTON is minted and sent to your wallet. Use it for transaction fees across AtomOne, IBC transfers, and ICS payments.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-bg-card rounded-xl border border-border p-6 relative"
            >
              <div className="text-4xl font-display text-accent/20 mb-4">
                {step.num}
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: "🔢",
              title: "The Math",
              content: (
                <>
                  <div className="bg-bg-elevated rounded-lg p-3 mb-3 font-mono text-sm text-accent">
                    rate = (1,000,000,000 − photon_supply) / atone_supply
                  </div>
                  <p className="text-sm text-text-secondary">
                    As more PHOTON is minted, the rate decreases. As ATONE inflates (7-20% annually), the rate also decreases. Early burners get more PHOTON per ATONE.
                  </p>
                </>
              ),
            },
            {
              icon: "🚫",
              title: "No Going Back",
              content: (
                <p className="text-sm text-text-secondary">
                  PHOTON cannot be converted back to ATONE at the protocol level. This one-way gate ensures the staking token&apos;s security properties are never undermined by fee-token holders.
                </p>
              ),
            },
            {
              icon: "📊",
              title: "Supply Dynamics",
              content: (
                <p className="text-sm text-text-secondary">
                  Max supply: <strong className="text-text-primary">1 billion PHOTON</strong>. This cap can never be reached because it would require burning all ATONE — impossible while validators stake. PHOTON is non-inflationary by design.
                </p>
              ),
            },
            {
              icon: "⚙️",
              title: "Fee Transition",
              content: (
                <p className="text-sm text-text-secondary">
                  Currently both ATONE and PHOTON are accepted for fees (transition period). A future governance vote will make PHOTON the <strong className="text-text-primary">exclusive</strong> fee token across all shards.
                </p>
              ),
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-bg-card rounded-xl border border-border p-6"
            >
              <h4 className="flex items-center gap-2 text-text-primary font-medium mb-3">
                <span>{card.icon}</span> {card.title}
              </h4>
              {card.content}
            </div>
          ))}
        </div>
      </Section>

      {/* Dual Token Model */}
      <Section
        tag="Architecture"
        title="The dual-token thesis"
        desc="Separating staking from fees isn't just elegant — it's a security imperative for IBC hub chains."
        dark
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start mb-8">
          <div className="bg-bg-card rounded-xl border border-atone/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⬡</span>
              <div>
                <h3 className="text-lg font-medium text-text-primary">ATONE</h3>
                <span className="text-xs font-mono text-atone">
                  Staking & Governance
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>🔐 Secures the network via proof-of-stake</li>
              <li>🗳️ Direct voting only — no validator proxy</li>
              <li>📈 7-20% dynamic inflation targeting ⅔ bonding</li>
              <li>🚫 Liquid staking derivatives prohibited</li>
              <li>🔥 Can be burned → PHOTON (one-way)</li>
            </ul>
          </div>

          <div className="flex md:flex-col items-center gap-2 py-4 self-center">
            <div className="flex-1 md:w-px md:h-16 h-px w-16 bg-border" />
            <span className="text-xs font-mono text-text-muted text-center">
              separated
              <br />
              by design
            </span>
            <div className="flex-1 md:w-px md:h-16 h-px w-16 bg-border" />
          </div>

          <div className="bg-bg-card rounded-xl border border-accent/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">◎</span>
              <div>
                <h3 className="text-lg font-medium text-text-primary">PHOTON</h3>
                <span className="text-xs font-mono text-accent">
                  Fees & Payments
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>💸 Exclusive fee token for all transactions</li>
              <li>🌐 Used across IBC, ICS, and all shards</li>
              <li>📉 Non-inflationary — capped at 1B supply</li>
              <li>🏭 Only created by burning ATONE</li>
              <li>💎 No dilution for holders</li>
            </ul>
          </div>
        </div>

        <div className="bg-bg-card rounded-xl border border-border p-6 space-y-3">
          <h4 className="font-medium text-text-primary">
            Why this matters for security
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            When a single token handles both staking and fees, attackers can buy the token on exchanges, stake enough to control ⅔ of consensus, and manipulate IBC transactions to steal pegged assets.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            With separated tokens, accumulating fee tokens gives <strong className="text-text-primary">zero consensus power</strong>. Attacking requires acquiring ATONE — which is illiquid by design, has no LSD derivatives, and is locked in staking.
          </p>
        </div>
      </Section>

      {/* Constitution */}
      <Section
        tag="Constitutional Law"
        title="Written in the constitution"
        desc="PHOTON isn't a feature — it's a constitutional mandate. Article 3, Section 5 of the AtomOne Constitution."
      >
        <div className="bg-bg-card rounded-xl border border-accent/20 p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs font-mono px-2 py-1 rounded bg-accent/10 text-accent">
              Article 3 — Economic Model
            </span>
            <span className="text-xs font-mono text-text-muted">
              Section 5: The PHOTON Token
            </span>
          </div>
          <blockquote className="space-y-4 text-text-secondary leading-relaxed border-l-2 border-accent/30 pl-5">
            <p>
              The PHOTON shall be the <strong className="text-text-primary">only fee token</strong> except for ATONE to PHOTON burn transactions. This applies for all transactions on the root and core shards, and all IBC and ICS payments.
            </p>
            <p>
              ATONE tokens may be burned to PHOTON tokens at a conversion rate set by law such that the total amount of PHOTONs mintable through burning ATONE tokens shall be <strong className="text-text-primary">capped at 1B PHOTON tokens</strong>.
            </p>
            <p>
              PHOTONs <strong className="text-text-primary">cannot be converted back</strong> into ATONE tokens.
            </p>
          </blockquote>
          <div className="mt-5">
            <a
              href="https://github.com/atomone-hub/genesis/blob/main/CONSTITUTION.md"
              target="_blank"
              className="text-sm font-mono"
            >
              Read the full constitution →
            </a>
          </div>
        </div>

        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          AtomOne is one of the few blockchains where the fee token&apos;s role is constitutionally enshrined — not just a software parameter, but a foundational principle that requires a <strong className="text-text-primary">90%+ Constitutional Majority</strong> to amend.
        </p>
      </Section>

      {/* Dynamic Fee Module */}
      <Section
        tag="Fee Economics"
        title="Dynamic fee pricing"
        desc="AtomOne uses an adaptive EIP-1559 mechanism to automatically adjust transaction fees based on network congestion."
        dark
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: "📈",
              title: "When blocks are full",
              desc: "Base gas price increases multiplicatively — fees spike to discourage spam and prioritize legitimate transactions.",
            },
            {
              icon: "📉",
              title: "When blocks are empty",
              desc: "Base gas price decreases additively — fees gradually return to the floor. Fast up, slow down prevents oscillation.",
            },
            {
              icon: "🛡️",
              title: "DOS protection",
              desc: "Born from a real March 2025 attack where bloated multi-send transactions overloaded nodes. The dynamic fee module automates the response.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-bg-card rounded-xl border border-border p-6"
            >
              <div className="text-2xl mb-3">{card.icon}</div>
              <h4 className="font-medium text-text-primary mb-2">
                {card.title}
              </h4>
              <p className="text-sm text-text-secondary">{card.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
          Approved via{" "}
          <a href="https://gov.atom.one/proposals/15" target="_blank">
            Proposal #15
          </a>
          , the <code>x/dynamicfee</code> module implements AIMD EIP-1559 — a
          refinement of Ethereum&apos;s fee model with an adaptive learning rate.
          Since PHOTON is the fee token, dynamic pricing directly affects
          PHOTON&apos;s utility value.
        </p>
      </Section>

      {/* Nakamoto Bonus */}
      <Section
        tag="Decentralization Incentive"
        title="The Nakamoto bonus"
        desc="A novel reward mechanism that incentivizes delegators to spread stake across smaller validators."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-text-primary">How it works</h4>
            <p className="text-sm text-text-secondary">
              Block rewards are split into two components:
            </p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <strong className="text-text-primary">Proportional Reward</strong> — distributed based on each validator&apos;s stake (traditional model)
              </li>
              <li>
                <strong className="text-text-primary">Nakamoto Bonus</strong> — distributed <em>uniformly</em> across all active validators, regardless of stake size
              </li>
            </ul>
            <p className="text-sm text-text-secondary">
              Smaller validators get a disproportionately larger share, making delegation to them more attractive.
            </p>
          </div>

          <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono text-accent mb-1">5 → ?</div>
              <div className="text-xs font-mono text-text-muted">
                Nakamoto coefficient (improving)
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-mono text-text-primary mb-1">34</div>
              <div className="text-xs font-mono text-text-muted">
                Ideal coefficient (100 validators)
              </div>
            </div>
            <p className="text-xs text-text-muted text-center">
              Approved via{" "}
              <a href="https://gov.atom.one/proposals/12" target="_blank">
                Proposal #12
              </a>
              . The Nakamoto coefficient measures the minimum validators needed
              to compromise 33.4% of consensus.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
