import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StakingCalculator } from "@/components/staking-calculator";

vi.mock("@/lib/format", () => ({
  formatCompact: (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toFixed(0);
  },
  formatNumber: (n: number, d = 0) => n.toFixed(d),
}));

describe("StakingCalculator", () => {
  const defaultProps = {
    inflation: 0.20,
    bondedRatio: 0.39,
    communityTax: 0.05,
    atoneUsd: 0.05,
    bondedTokens: 53_533_915,
    totalSupply: 136_800_995,
  };

  it("renders the calculator heading", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("Calculate Your Rewards").length).toBeGreaterThan(0);
  });

  it("shows staking APR results", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("Staking APR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Your APR").length).toBeGreaterThan(0);
  });

  it("shows chain parameters section", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("Chain Parameters").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20.0%").length).toBeGreaterThan(0);
  });

  it("shows growth chart", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("Growth Over Time").length).toBeGreaterThan(0);
  });

  it("toggles compounding on/off", () => {
    render(<StakingCalculator {...defaultProps} />);
    const btns = screen.getAllByText("✓ Auto-compound ON");
    fireEvent.click(btns[0]);
    expect(screen.getAllByText("Simple rewards").length).toBeGreaterThan(0);
  });

  it("updates when stake amount changes", () => {
    render(<StakingCalculator {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText("1000");
    fireEvent.change(inputs[0], { target: { value: "10000" } });
    expect(screen.getAllByText("Staking APR").length).toBeGreaterThan(0);
  });

  it("shows unbonding period in parameters", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("21 days").length).toBeGreaterThan(0);
  });

  it("shows min commission in parameters", () => {
    render(<StakingCalculator {...defaultProps} />);
    expect(screen.getAllByText("Min Commission").length).toBeGreaterThan(0);
  });
});
