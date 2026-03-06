"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { Section } from "@/components/section";

export function ConversionCalculator({ rate }: { rate: number }) {
  const [atoneAmount, setAtoneAmount] = useState("");

  const photonResult =
    atoneAmount && rate > 0 ? parseFloat(atoneAmount) * rate : null;

  return (
    <Section
      tag="Tool"
      title="Burn Calculator"
      desc="See how much PHOTON you'd receive for burning ATONE at the current conversion rate."
      id="calculator"
    >
      <div className="max-w-xl mx-auto bg-bg-card rounded-xl border border-border p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="calc-atone"
              className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2 block"
            >
              ATONE to burn
            </label>
            <div className="relative">
              <input
                id="calc-atone"
                type="number"
                placeholder="1000"
                min="0"
                step="any"
                value={atoneAmount}
                onChange={(e) => setAtoneAmount(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-3 font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">
                ATONE
              </span>
            </div>
          </div>

          <div className="text-center text-2xl text-accent">⚡</div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2 block">
              PHOTON you&apos;d receive
            </label>
            <div className="text-2xl md:text-3xl font-mono font-medium text-accent">
              {photonResult !== null
                ? formatNumber(photonResult, 4) + " PHOTON"
                : "—"}
            </div>
            <div className="text-xs font-mono text-text-muted mt-2">
              at rate: {rate.toFixed(4)} PHOTON/ATONE
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted text-center mt-4 max-w-lg mx-auto">
        ⚠️ This is an estimate based on the current conversion rate. The actual
        rate may differ at transaction time. Burning ATONE is irreversible.
      </p>
    </Section>
  );
}
