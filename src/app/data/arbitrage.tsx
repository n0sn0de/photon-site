import { Section } from "@/components/section";
import { formatUsd, formatCompact, formatPct } from "@/lib/format";

interface ArbitrageSectionProps {
  mintCost: number | null;
  buyCost: number | null;
  atoneUsd: number | null;
  rate: number;
  photon24hChange: number | null;
  photonMcap: number | null;
  arbPct: number | null;
}

export function ArbitrageSection({
  mintCost,
  buyCost,
  atoneUsd,
  rate,
  photon24hChange,
  photonMcap,
  arbPct,
}: ArbitrageSectionProps) {
  const mintCheaper = arbPct !== null && arbPct > 0;
  const absDiff = arbPct !== null ? Math.abs(arbPct) : null;

  return (
    <Section
      tag="Arbitrage"
      title="Mint or buy?"
      desc="Compare the cost of minting PHOTON (burning ATONE on-chain) versus buying PHOTON on Osmosis DEX. Prices from CoinGecko."
      id="arbitrage"
      dark
    >
      {/* Signal */}
      <div
        className={`flex items-center gap-4 p-5 rounded-xl border mb-8 ${
          arbPct === null
            ? "bg-bg-card border-border"
            : mintCheaper
              ? "bg-success/5 border-success/20"
              : "bg-atone/5 border-atone/20"
        }`}
      >
        <span className="text-3xl">
          {arbPct === null ? "⏳" : mintCheaper ? "🔥" : "💱"}
        </span>
        <div>
          <div className="font-mono font-medium text-text-primary">
            {arbPct === null
              ? "Loading..."
              : mintCheaper
                ? "MINT IS CHEAPER"
                : "BUY IS CHEAPER"}
          </div>
          <div className="text-sm text-text-secondary">
            {arbPct === null
              ? "Fetching price data"
              : mintCheaper
                ? `Minting saves ${absDiff?.toFixed(1)}% vs buying on Osmosis`
                : `Buying on Osmosis saves ${absDiff?.toFixed(1)}% vs minting`}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        {/* Mint card */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="text-xs font-mono text-text-muted mb-1">
            🔥 Mint (Burn ATONE)
          </div>
          <div className="text-2xl font-mono font-medium text-text-primary mb-1">
            {formatUsd(mintCost, 6)}
          </div>
          <div className="text-xs text-text-muted mb-4">cost per PHOTON</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">ATONE Price</span>
              <span className="text-text-secondary font-mono">
                {formatUsd(atoneUsd, 4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Conversion Rate</span>
              <span className="text-text-secondary font-mono">
                {rate.toFixed(4)} PHOTON/ATONE
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Formula</span>
              <span className="text-text-secondary font-mono text-xs">
                ATONE$ ÷ rate
              </span>
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="flex md:flex-col items-center gap-2 py-2">
          <div className="flex-1 md:w-px md:h-16 h-px w-16 bg-border" />
          <span
            className={`text-xs font-mono px-2 py-1 rounded ${
              arbPct !== null
                ? mintCheaper
                  ? "text-success"
                  : "text-atone"
                : "text-text-muted"
            }`}
          >
            {absDiff !== null
              ? mintCheaper
                ? `Mint saves ${absDiff.toFixed(1)}%`
                : `Buy saves ${absDiff.toFixed(1)}%`
              : "—"}
          </span>
          <div className="flex-1 md:w-px md:h-16 h-px w-16 bg-border" />
        </div>

        {/* Buy card */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="text-xs font-mono text-text-muted mb-1">
            💱 Buy on Osmosis
          </div>
          <div className="text-2xl font-mono font-medium text-text-primary mb-1">
            {formatUsd(buyCost, 6)}
          </div>
          <div className="text-xs text-text-muted mb-4">
            market price per PHOTON
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">PHOTON Price</span>
              <span className="text-text-secondary font-mono">
                {formatUsd(buyCost, 6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">24h Change</span>
              <span
                className={`font-mono ${
                  photon24hChange !== null
                    ? photon24hChange >= 0
                      ? "text-success"
                      : "text-danger"
                    : "text-text-muted"
                }`}
              >
                {photon24hChange !== null
                  ? `${photon24hChange >= 0 ? "+" : ""}${photon24hChange.toFixed(2)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Market Cap</span>
              <span className="text-text-secondary font-mono">
                {photonMcap
                  ? "$" + formatCompact(photonMcap)
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explainer */}
      <div className="mt-8 bg-bg-card rounded-xl border border-border p-6 space-y-3">
        <h4 className="font-mono text-sm text-text-primary">
          How the arbitrage works
        </h4>
        <p className="text-sm text-text-secondary leading-relaxed">
          When minting is cheaper than buying, arbitrageurs can burn ATONE →
          mint PHOTON → sell on Osmosis for profit. This increases PHOTON supply
          and DEX selling pressure, pushing the market price down toward the
          mint cost.
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          When buying is cheaper than minting, traders buy PHOTON on Osmosis
          instead of burning ATONE. Over time, these forces keep the market
          price loosely anchored to the mint cost.
        </p>
      </div>
    </Section>
  );
}
