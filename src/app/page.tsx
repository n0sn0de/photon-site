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
    </>
  );
}
