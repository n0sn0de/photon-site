import Link from "next/link";
import { fetchAllChainData } from "@/lib/chain-api";
import { fetchPrices } from "@/lib/coingecko";
import {
  formatCompact,
  formatUsd,
  formatPct,
  microToToken,
  photonMintedPct,
  remainingMintable,
} from "@/lib/format";
import { PhotonParticles } from "@/components/photon-particles";

export default async function HomePage() {
  const [chainData, prices] = await Promise.all([
    fetchAllChainData(),
    fetchPrices(),
  ]);

  const photonSupply = chainData.supply
    ? microToToken(chainData.supply.photonSupply)
    : null;
  const rate = chainData.conversionRate;
  const remaining = chainData.supply
    ? remainingMintable(chainData.supply.photonSupply)
    : null;
  const mintedPct = chainData.supply
    ? photonMintedPct(chainData.supply.photonSupply)
    : null;
  const bondedTokens = chainData.pool
    ? microToToken(chainData.pool.bondedTokens)
    : null;
  const atoneSupply = chainData.supply
    ? microToToken(chainData.supply.atoneSupply)
    : null;
  const bondedPct =
    bondedTokens && atoneSupply ? (bondedTokens / atoneSupply) * 100 : null;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated photon particles */}
        <PhotonParticles />
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-atone/5 blur-[100px] animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/3 blur-[80px]" />
        </div>

        <div className="relative max-w-container mx-auto px-4 md:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-mono uppercase tracking-widest mb-8">
            AtomOne&apos;s Fee Token
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.95] mb-8">
            <span className="block text-text-primary">The light</span>
            <span className="block text-accent italic">that fuels</span>
            <span className="block text-text-primary">AtomOne</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
            PHOTON is the dedicated fee token of the AtomOne blockchain — born
            from burning ATONE, capped at 1 billion, non-inflationary by design.
            A return to the original Cosmos vision of separated token roles.
          </p>

          {/* Hero stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
            <div className="text-center px-8">
              <div className="text-2xl md:text-3xl font-mono font-medium text-text-primary">
                {photonSupply ? formatCompact(photonSupply) : "—"}
              </div>
              <div className="text-xs font-mono text-text-muted mt-1">
                PHOTON Supply
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="text-center px-8">
              <div className="text-2xl md:text-3xl font-mono font-medium text-text-primary">
                {rate ? rate.toFixed(4) + ":1" : "—"}
              </div>
              <div className="text-xs font-mono text-text-muted mt-1">
                ATONE → PHOTON Rate
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="text-center px-8">
              <div className="text-2xl md:text-3xl font-mono font-medium text-text-primary">
                {remaining ? formatCompact(remaining) : "—"}
              </div>
              <div className="text-xs font-mono text-text-muted mt-1">
                Mintable Remaining
              </div>
            </div>
          </div>

          {/* Price bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm font-mono">
            {prices.photonUsd && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">PHOTON</span>
                <span className="text-text-primary">
                  {formatUsd(prices.photonUsd)}
                </span>
                {prices.photon24hChange !== null && (
                  <span
                    className={
                      prices.photon24hChange >= 0
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {prices.photon24hChange >= 0 ? "+" : ""}
                    {prices.photon24hChange.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
            {prices.atoneUsd && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">ATONE</span>
                <span className="text-text-primary">
                  {formatUsd(prices.atoneUsd)}
                </span>
              </div>
            )}
            {bondedPct && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Bonded</span>
                <span className="text-text-primary">
                  {formatPct(bondedPct)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted text-xs font-mono flex flex-col items-center gap-2 animate-bounce">
          <span>Scroll to explore</span>
          <span>↓</span>
        </div>
      </section>

      {/* Quick links */}
      <section className="section-dark py-16">
        <div className="max-w-container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/data", icon: "📊", label: "Live Data", desc: "Real-time chain metrics" },
              { href: "/mechanics", icon: "⚙️", label: "Mechanics", desc: "How PHOTON works" },
              { href: "/governance", icon: "🗳️", label: "Governance", desc: "Active proposals" },
              { href: "/mint", icon: "🔥", label: "Mint PHOTON", desc: "Burn ATONE on-chain" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-bg-card rounded-xl border border-border p-5 transition-all hover:border-accent/30 hover:bg-bg-card-hover no-underline group"
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <div className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-text-muted mt-1">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Why PHOTON? */}
      <section className="py-20">
        <div className="max-w-container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono uppercase tracking-widest mb-4">
              Why it matters
            </span>
            <h2 className="text-3xl md:text-4xl font-display text-text-primary mb-4">
              Why separate <span className="text-accent italic">fee tokens</span> from staking?
            </h2>
            <p className="text-text-secondary max-w-2xl leading-relaxed">
              Most blockchains use a single token for everything. AtomOne splits the roles on purpose — and the security implications are profound.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-accent/5 group-hover:bg-accent/10 transition-colors" />
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Security isolation
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Buying PHOTON gives you <strong className="text-text-primary">zero consensus power</strong>. Attackers can&apos;t accumulate fee tokens to take over validation. The staking token stays illiquid and locked.
              </p>
            </div>

            <div className="bg-bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-accent/5 group-hover:bg-accent/10 transition-colors" />
              <div className="text-3xl mb-4">📉</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Non-inflationary fees
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                PHOTON has a hard cap of 1 billion. No inflation, no dilution. While ATONE inflates 7-20% annually to incentivize staking, your PHOTON holdings never get diluted.
              </p>
            </div>

            <div className="bg-bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-accent/5 group-hover:bg-accent/10 transition-colors" />
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Deflationary by design
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Every PHOTON minted requires permanently burning ATONE. And as more gets minted, the conversion rate drops — early adopters get more PHOTON per ATONE.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-bg-card rounded-xl border border-accent/10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div className="text-center">
                <div className="text-4xl font-display text-atone mb-2">ATONE</div>
                <p className="text-xs text-text-muted font-mono">Stake · Vote · Secure</p>
                <p className="text-sm text-text-secondary mt-2">
                  Inflationary staking token. Liquid staking derivatives banned. Direct voting only — no delegation of votes.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-accent text-2xl">→</div>
                <span className="text-[10px] font-mono text-text-muted">burn</span>
                <div className="text-danger text-2xl">🔥</div>
                <span className="text-[10px] font-mono text-text-muted">irreversible</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display text-accent mb-2">PHOTON</div>
                <p className="text-xs text-text-muted font-mono">Pay · Transfer · Transact</p>
                <p className="text-sm text-text-secondary mt-2">
                  Non-inflationary fee token. Capped at 1B. Used for all tx fees, IBC, and ICS payments across all shards.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/mechanics"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent font-mono text-sm hover:bg-accent/20 transition-colors no-underline"
            >
              Deep dive into the mechanics →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-dark py-16">
        <div className="max-w-container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-display text-text-primary mb-4">
            Ready to explore <span className="text-accent italic">Photon</span>?
          </h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Check live chain data, mint your own PHOTON, or explore the growing AtomOne ecosystem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/data"
              className="px-6 py-3 rounded-lg bg-accent text-bg-primary font-mono font-medium text-sm hover:bg-accent-bright transition-colors no-underline"
            >
              📊 View Live Data
            </Link>
            <Link
              href="/mint"
              className="px-6 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent font-mono text-sm hover:bg-accent/20 transition-colors no-underline"
            >
              🔥 Mint PHOTON
            </Link>
            <Link
              href="/ecosystem"
              className="px-6 py-3 rounded-lg bg-bg-card border border-border text-text-secondary font-mono text-sm hover:text-text-primary hover:border-accent/20 transition-colors no-underline"
            >
              🌐 Ecosystem
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
