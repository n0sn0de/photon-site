import { describe, it, expect } from "vitest";
import {
  formatNumber,
  microToToken,
  formatToken,
  formatCompact,
  formatUsd,
  formatPct,
  photonMintedPct,
  remainingMintable,
  calcConversionRate,
  calcMintCost,
  calcArbitragePct,
  estimateAtoneBurned,
} from "@/lib/format";

describe("formatNumber", () => {
  it("formats whole numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formats with specified decimals", () => {
    expect(formatNumber(1234.5678, 2)).toBe("1,234.57");
  });

  it("returns dash for null/undefined", () => {
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(undefined)).toBe("—");
  });

  it("returns dash for NaN", () => {
    expect(formatNumber(NaN)).toBe("—");
  });
});

describe("microToToken", () => {
  it("converts micro units to tokens", () => {
    expect(microToToken(1_000_000)).toBe(1);
    expect(microToToken("50000000")).toBe(50);
  });

  it("handles zero", () => {
    expect(microToToken(0)).toBe(0);
  });
});

describe("formatToken", () => {
  it("formats micro-unit amounts as tokens", () => {
    expect(formatToken(136_731_102_000_000)).toBe("136,731,102.00");
  });

  it("returns dash for null", () => {
    expect(formatToken(null)).toBe("—");
    expect(formatToken(undefined)).toBe("—");
  });
});

describe("formatCompact", () => {
  it("formats billions", () => {
    expect(formatCompact(1_500_000_000)).toBe("1.50B");
  });

  it("formats millions", () => {
    expect(formatCompact(42_500_000)).toBe("42.50M");
  });

  it("formats thousands", () => {
    expect(formatCompact(7_500)).toBe("7.5K");
  });

  it("formats small numbers", () => {
    expect(formatCompact(42)).toBe("42");
  });

  it("returns dash for null/NaN", () => {
    expect(formatCompact(null)).toBe("—");
    expect(formatCompact(NaN)).toBe("—");
  });
});

describe("formatUsd", () => {
  it("formats normal prices", () => {
    expect(formatUsd(1.23)).toBe("$1.23");
  });

  it("formats tiny prices with more decimals", () => {
    expect(formatUsd(0.004567)).toBe("$0.004567");
  });

  it("returns dash for null", () => {
    expect(formatUsd(null)).toBe("—");
  });
});

describe("formatPct", () => {
  it("formats percentage", () => {
    expect(formatPct(42.567)).toBe("42.6%");
  });

  it("returns dash for null", () => {
    expect(formatPct(null)).toBe("—");
  });
});

describe("photonMintedPct", () => {
  it("calculates minted percentage", () => {
    // 74M PHOTON minted = 7.4%
    const pct = photonMintedPct(74_000_000_000_000);
    expect(pct).toBeCloseTo(7.4, 1);
  });
});

describe("remainingMintable", () => {
  it("calculates remaining mintable PHOTON", () => {
    const remaining = remainingMintable(74_000_000_000_000);
    expect(remaining).toBe(926_000_000);
  });
});

describe("calcConversionRate", () => {
  it("calculates rate from supplies", () => {
    // (1B*1e6 - 74M*1e6) / 136M*1e6 ≈ 6.8
    const rate = calcConversionRate(74_000_000_000_000, 136_000_000_000_000);
    expect(rate).toBeCloseTo(6.8088, 2);
  });

  it("returns 0 for zero atone supply", () => {
    expect(calcConversionRate(0, 0)).toBe(0);
  });
});

describe("calcMintCost", () => {
  it("calculates cost per PHOTON via minting", () => {
    // ATONE = $0.05, rate = 6.8 → mint cost = $0.05 / 6.8 ≈ $0.00735
    const cost = calcMintCost(0.05, 6.8);
    expect(cost).toBeCloseTo(0.00735, 4);
  });

  it("returns 0 for zero rate", () => {
    expect(calcMintCost(0.05, 0)).toBe(0);
  });
});

describe("calcArbitragePct", () => {
  it("positive when buy is more expensive (mint saves)", () => {
    const pct = calcArbitragePct(0.007, 0.01);
    expect(pct).toBeCloseTo(30, 0);
  });

  it("negative when mint is more expensive (buy saves)", () => {
    const pct = calcArbitragePct(0.01, 0.007);
    expect(pct).toBeLessThan(0);
  });
});

describe("estimateAtoneBurned", () => {
  it("estimates burned ATONE from photon supply and rate", () => {
    const burned = estimateAtoneBurned(74_000_000_000_000, 6.8);
    expect(burned).toBeCloseTo(10_882_353, -2);
  });
});
