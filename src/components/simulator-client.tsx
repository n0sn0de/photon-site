"use client";

import { useState, useMemo } from "react";
import { ConversionChart } from "./conversion-chart";
import { formatCompact, formatNumber } from "@/lib/format";

interface SimulatorClientProps {
  currentPhotonSupply: number; // in tokens
  atoneSupply: number; // in tokens
  currentRate: number;
  atoneUsd: number | null;
  photonUsd: number | null;
}

const MAX_PHOTON = 1_000_000_000;

function calcRate(photonSupply: number, atoneSupply: number): number {
  if (atoneSupply === 0) return 0;
  return (MAX_PHOTON - photonSupply) / atoneSupply;
}

export function SimulatorClient({
  currentPhotonSupply,
  atoneSupply,
  currentRate,
  atoneUsd,
  photonUsd,
}: SimulatorClientProps) {
  const remainingMintable = MAX_PHOTON - currentPhotonSupply;
  const [mintAmount, setMintAmount] = useState(0);
  const [atoneInput, setAtoneInput] = useState("");

  const simulatedRate = useMemo(() => {
    const newSupply = Math.min(currentPhotonSupply + mintAmount, MAX_PHOTON);
    return calcRate(newSupply, atoneSupply);
  }, [mintAmount, currentPhotonSupply, atoneSupply]);

  const rateDrop = currentRate > 0 ? ((currentRate - simulatedRate) / currentRate) * 100 : 0;

  // ATONE input calculator
  const atoneValue = parseFloat(atoneInput) || 0;
  const photonFromAtone = atoneValue * currentRate;
  const atoneUsdValue = atoneUsd ? atoneValue * atoneUsd : null;
  const photonUsdValue = photonUsd ? photonFromAtone * photonUsd : null;
  const mintCostUsd = atoneUsd && currentRate > 0 ? atoneUsd / currentRate : null;
  const arbitrage = mintCostUsd && photonUsd ? ((photonUsd - mintCostUsd) / photonUsd) * 100 : null;

  // Milestones
  const milestones = [
    { pct: 10, supply: MAX_PHOTON * 0.1 },
    { pct: 25, supply: MAX_PHOTON * 0.25 },
    { pct: 50, supply: MAX_PHOTON * 0.5 },
    { pct: 75, supply: MAX_PHOTON * 0.75 },
    { pct: 90, supply: MAX_PHOTON * 0.9 },
    { pct: 99, supply: MAX_PHOTON * 0.99 },
  ];

  return (
    <div className="space-y-10">
      {/* Conversion Chart */}
      <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
        <h2 className="text-lg font-medium text-text-primary mb-1">
          Conversion Rate Curve
        </h2>
        <p className="text-sm text-text-muted mb-4">
          The rate decreases linearly as more PHOTON is minted. Drag the slider to simulate future minting.
        </p>
        <ConversionChart
          currentPhotonSupply={currentPhotonSupply}
          atoneSupply={atoneSupply}
          simulatedMint={mintAmount}
        />

        {/* Slider */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted font-mono">Simulate additional mint</span>
            <span className="text-warning font-mono font-medium">
              +{formatCompact(mintAmount)} PHOTON
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={remainingMintable}
            step={Math.max(1, Math.floor(remainingMintable / 1000))}
            value={mintAmount}
            onChange={(e) => setMintAmount(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-bg-elevated
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-accent/30 [&::-webkit-slider-thumb]:cursor-grab
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-grab"
          />
          <div className="flex items-center justify-between text-xs text-text-muted font-mono">
            <span>0</span>
            <span>{formatCompact(remainingMintable)} remaining</span>
          </div>
        </div>

        {/* Simulation results */}
        {mintAmount > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">New Rate</div>
              <div className="text-xl font-mono text-warning font-medium">
                {simulatedRate.toFixed(4)}:1
              </div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">Rate Drop</div>
              <div className="text-xl font-mono text-danger font-medium">
                -{rateDrop.toFixed(2)}%
              </div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">New Supply</div>
              <div className="text-xl font-mono text-text-primary font-medium">
                {formatCompact(currentPhotonSupply + mintAmount)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ATONE → PHOTON Calculator */}
      <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
        <h2 className="text-lg font-medium text-text-primary mb-1">
          Mint Calculator
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Enter an ATONE amount to see how much PHOTON you&apos;d receive at the current rate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">You burn</label>
            <div className="relative">
              <input
                type="number"
                placeholder="100"
                value={atoneInput}
                onChange={(e) => setAtoneInput(e.target.value)}
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-lg font-mono text-text-primary
                  placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-atone font-mono text-sm font-medium">
                ATONE
              </span>
            </div>
            {atoneUsdValue !== null && atoneValue > 0 && (
              <div className="text-xs text-text-muted font-mono">
                ≈ ${formatNumber(atoneUsdValue, 2)} USD
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl text-accent">→</div>
            <div className="text-[10px] font-mono text-text-muted">
              {currentRate.toFixed(4)}:1
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">You receive</label>
            <div className="bg-bg-secondary border border-accent/20 rounded-lg px-4 py-3">
              <div className="text-lg font-mono text-accent font-medium">
                {atoneValue > 0 ? formatNumber(photonFromAtone, 4) : "—"}
              </div>
              <div className="text-xs text-text-muted font-mono mt-0.5">PHOTON</div>
            </div>
            {photonUsdValue !== null && atoneValue > 0 && (
              <div className="text-xs text-text-muted font-mono">
                ≈ ${formatNumber(photonUsdValue, 2)} USD at market price
              </div>
            )}
          </div>
        </div>

        {/* Arbitrage indicator */}
        {arbitrage !== null && atoneValue > 0 && (
          <div className={`mt-6 rounded-lg border p-4 text-center ${
            arbitrage > 0
              ? "bg-success/5 border-success/20"
              : "bg-danger/5 border-danger/20"
          }`}>
            <div className="text-xs font-mono text-text-muted mb-1">
              Mint vs Buy Arbitrage
            </div>
            <div className={`text-xl font-mono font-medium ${
              arbitrage > 0 ? "text-success" : "text-danger"
            }`}>
              {arbitrage > 0 ? "🟢" : "🔴"} {arbitrage > 0 ? "+" : ""}{arbitrage.toFixed(2)}%
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {arbitrage > 0
                ? "Minting is cheaper than buying on the open market"
                : "Buying on the market is cheaper than minting"}
            </div>
          </div>
        )}
      </div>

      {/* Rate Milestones Table */}
      <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
        <h2 className="text-lg font-medium text-text-primary mb-1">
          Rate Milestones
        </h2>
        <p className="text-sm text-text-muted mb-4">
          How the conversion rate evolves as the PHOTON supply fills up.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-text-muted border-b border-border">
                <th className="text-left py-2 px-3">Supply %</th>
                <th className="text-right py-2 px-3">PHOTON Supply</th>
                <th className="text-right py-2 px-3">Rate</th>
                <th className="text-right py-2 px-3">vs Current</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map(({ pct, supply }) => {
                const rate = calcRate(supply, atoneSupply);
                const vsCurrent = currentRate > 0 ? ((rate - currentRate) / currentRate) * 100 : 0;
                const isPast = supply < currentPhotonSupply;
                return (
                  <tr
                    key={pct}
                    className={`border-b border-border/50 ${
                      isPast ? "text-text-muted/60" : "text-text-secondary"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span className={isPast ? "" : "text-text-primary"}>
                        {pct}%
                      </span>
                      {isPast && (
                        <span className="ml-2 text-[10px] text-text-muted">passed</span>
                      )}
                    </td>
                    <td className="text-right py-2.5 px-3">
                      {formatCompact(supply)}
                    </td>
                    <td className="text-right py-2.5 px-3">
                      {rate.toFixed(4)}:1
                    </td>
                    <td className={`text-right py-2.5 px-3 ${
                      vsCurrent < 0 ? "text-danger" : "text-success"
                    }`}>
                      {vsCurrent > 0 ? "+" : ""}{vsCurrent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-bg-card rounded-xl border border-accent/10 p-4 md:p-6">
        <h2 className="text-lg font-medium text-text-primary mb-3">
          How the Conversion Works
        </h2>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            The ATONE→PHOTON conversion follows a simple linear formula defined in the
            AtomOne Constitution (Article 3, Section 5):
          </p>
          <div className="bg-bg-secondary rounded-lg p-4 text-center">
            <code className="text-accent text-base">
              rate = (1,000,000,000 - photon_supply) / atone_supply
            </code>
          </div>
          <p>
            This means <strong className="text-text-primary">early minters get more PHOTON per ATONE</strong>.
            As more PHOTON enters circulation, each subsequent mint yields less. The rate approaches
            zero as the supply approaches the 1 billion cap — but it can never actually reach it,
            since that would require burning all ATONE in existence.
          </p>
          <p>
            The conversion is <strong className="text-text-primary">irreversible</strong>. Once you
            burn ATONE for PHOTON, there&apos;s no going back. This creates a permanent deflationary
            pressure on the ATONE supply while bootstrapping the fee token economy.
          </p>
          <p>
            <code>MsgMintPhoton</code> is fee-exempt — you don&apos;t need to already hold PHOTON
            to mint your first ones. This ensures the bootstrap process is accessible to all ATONE holders.
          </p>
        </div>
      </div>
    </div>
  );
}
