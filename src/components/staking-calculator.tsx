"use client";

import { useState, useMemo } from "react";
import { formatNumber, formatCompact } from "@/lib/format";

interface StakingCalcProps {
  inflation: number; // e.g. 0.20 for 20%
  bondedRatio: number; // e.g. 0.39 for 39%
  communityTax: number; // e.g. 0.05 for 5%
  atoneUsd: number | null;
  bondedTokens: number; // total bonded in tokens
  totalSupply: number; // total ATONE supply in tokens
}

export function StakingCalculator({
  inflation,
  bondedRatio,
  communityTax,
  atoneUsd,
  bondedTokens,
  totalSupply,
}: StakingCalcProps) {
  const [stakeAmount, setStakeAmount] = useState("1000");
  const [commission, setCommission] = useState(5);
  const [duration, setDuration] = useState(12); // months
  const [compound, setCompound] = useState(true);

  const stakeValue = parseFloat(stakeAmount) || 0;

  const calculations = useMemo(() => {
    if (stakeValue <= 0 || bondedTokens <= 0) {
      return null;
    }

    // Annual provisions = total_supply * inflation
    const annualProvisions = totalSupply * inflation;

    // Community pool cut
    const afterCommunityTax = annualProvisions * (1 - communityTax);

    // Staking APR = (annual_provisions * (1 - community_tax)) / bonded_tokens
    const stakingAPR = afterCommunityTax / bondedTokens;

    // After validator commission
    const effectiveAPR = stakingAPR * (1 - commission / 100);

    // Monthly rate
    const monthlyRate = effectiveAPR / 12;

    // Simple vs compound over duration
    let simpleRewards = 0;
    let compoundedBalance = stakeValue;
    const monthlyData: Array<{
      month: number;
      balance: number;
      rewards: number;
      cumRewards: number;
    }> = [];

    for (let m = 1; m <= duration; m++) {
      const monthReward = compound
        ? compoundedBalance * monthlyRate
        : stakeValue * monthlyRate;

      if (compound) {
        compoundedBalance += monthReward;
      }
      simpleRewards += stakeValue * monthlyRate;

      monthlyData.push({
        month: m,
        balance: compound ? compoundedBalance : stakeValue + simpleRewards,
        rewards: monthReward,
        cumRewards: compound
          ? compoundedBalance - stakeValue
          : simpleRewards,
      });
    }

    const totalRewards = compound
      ? compoundedBalance - stakeValue
      : simpleRewards;

    const effectiveAPY = Math.pow(1 + monthlyRate, 12) - 1;

    return {
      stakingAPR,
      effectiveAPR,
      effectiveAPY,
      totalRewards,
      finalBalance: compound ? compoundedBalance : stakeValue + simpleRewards,
      monthlyData,
      annualProvisions,
    };
  }, [stakeValue, inflation, communityTax, bondedTokens, totalSupply, commission, duration, compound]);

  // Bar chart - show monthly growth
  const maxBalance = calculations?.monthlyData
    ? Math.max(...calculations.monthlyData.map((d) => d.balance))
    : 0;

  return (
    <div className="space-y-8">
      {/* Input controls */}
      <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
        <h2 className="text-lg font-medium text-text-primary mb-4">
          Calculate Your Rewards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stake amount */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">
              Stake Amount (ATONE)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="1000"
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2.5 font-mono text-text-primary
                placeholder:text-text-muted/50 focus:outline-none focus:border-accent/40 transition-colors"
            />
            {atoneUsd && stakeValue > 0 && (
              <div className="text-xs text-text-muted font-mono">
                ≈ ${formatNumber(stakeValue * atoneUsd, 2)}
              </div>
            )}
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">
              Validator Commission: {commission}%
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-bg-elevated
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-none"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>5% (min)</span>
              <span>50%</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">
              Duration: {duration} month{duration !== 1 ? "s" : ""}
            </label>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-bg-elevated
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-none"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>1 mo</span>
              <span>5 years</span>
            </div>
          </div>

          {/* Compound toggle */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-mono">
              Compounding
            </label>
            <button
              onClick={() => setCompound(!compound)}
              className={`w-full py-2.5 rounded-lg font-mono text-sm font-medium border transition-colors ${
                compound
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-bg-secondary border-border text-text-muted"
              }`}
            >
              {compound ? "✓ Auto-compound ON" : "Simple rewards"}
            </button>
            <div className="text-[10px] text-text-muted font-mono text-center">
              {compound ? "Rewards restaked monthly" : "No restaking"}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculations && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">Staking APR</div>
              <div className="text-2xl font-mono text-accent font-medium">
                {(calculations.stakingAPR * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                before commission
              </div>
            </div>

            <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">Your APR</div>
              <div className="text-2xl font-mono text-text-primary font-medium">
                {(calculations.effectiveAPR * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                after {commission}% commission
              </div>
            </div>

            <div className="bg-bg-card rounded-xl border border-accent/20 p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">
                Total Rewards ({duration}mo)
              </div>
              <div className="text-2xl font-mono text-success font-medium">
                +{formatNumber(calculations.totalRewards, 2)}
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                ATONE earned
                {atoneUsd && (
                  <> (≈ ${formatNumber(calculations.totalRewards * atoneUsd, 2)})</>
                )}
              </div>
            </div>

            <div className="bg-bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-xs text-text-muted font-mono mb-1">Final Balance</div>
              <div className="text-2xl font-mono text-text-primary font-medium">
                {formatCompact(calculations.finalBalance)}
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                ATONE
                {atoneUsd && (
                  <> (≈ ${formatCompact(calculations.finalBalance * atoneUsd)})</>
                )}
              </div>
            </div>
          </div>

          {/* Visual growth chart */}
          <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
            <h2 className="text-lg font-medium text-text-primary mb-4">
              Growth Over Time
            </h2>

            <div className="flex items-end gap-[2px] h-40 overflow-x-auto">
              {calculations.monthlyData.map((d) => {
                const initialPct = (stakeValue / maxBalance) * 100;
                const rewardPct = (d.cumRewards / maxBalance) * 100;
                return (
                  <div
                    key={d.month}
                    className="flex flex-col items-center flex-shrink-0 group relative"
                    style={{ width: `${Math.max(100 / calculations.monthlyData.length, 8)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-bg-elevated border border-border rounded-lg p-2 text-xs font-mono whitespace-nowrap z-10 shadow-lg">
                      <div className="text-text-muted">Month {d.month}</div>
                      <div className="text-text-primary">{formatNumber(d.balance, 2)} ATONE</div>
                      <div className="text-success">+{formatNumber(d.cumRewards, 2)} rewards</div>
                    </div>
                    {/* Bar */}
                    <div className="w-full flex flex-col justify-end h-40">
                      <div
                        className="w-full bg-success/40 rounded-t-sm transition-all"
                        style={{ height: `${rewardPct}%` }}
                      />
                      <div
                        className="w-full bg-accent/30 rounded-b-sm"
                        style={{ height: `${initialPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <div className="w-3 h-3 rounded-sm bg-accent/30" />
                Initial stake
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <div className="w-3 h-3 rounded-sm bg-success/40" />
                Rewards
              </div>
            </div>
          </div>

          {/* Chain parameters */}
          <div className="bg-bg-card rounded-xl border border-border p-4 md:p-6">
            <h2 className="text-lg font-medium text-text-primary mb-3">
              Chain Parameters
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-text-muted font-mono">Inflation Rate</div>
                <div className="text-text-primary font-mono">{(inflation * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Bonded Ratio</div>
                <div className="text-text-primary font-mono">{(bondedRatio * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Community Tax</div>
                <div className="text-text-primary font-mono">{(communityTax * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Annual Provisions</div>
                <div className="text-text-primary font-mono">{formatCompact(calculations.annualProvisions)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Bonded Tokens</div>
                <div className="text-text-primary font-mono">{formatCompact(bondedTokens)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Total Supply</div>
                <div className="text-text-primary font-mono">{formatCompact(totalSupply)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Min Commission</div>
                <div className="text-text-primary font-mono">5%</div>
              </div>
              <div>
                <div className="text-xs text-text-muted font-mono">Unbonding Period</div>
                <div className="text-text-primary font-mono">21 days</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
