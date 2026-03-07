import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SimulatorClient } from "@/components/simulator-client";

vi.mock("@/lib/format", () => ({
  formatCompact: (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toFixed(0);
  },
  formatNumber: (n: number, d = 0) => n.toFixed(d),
}));

describe("SimulatorClient", () => {
  const defaultProps = {
    currentPhotonSupply: 73_795_684,
    atoneSupply: 136_800_995,
    currentRate: 6.77,
    atoneUsd: 0.05,
    photonUsd: 0.008,
  };

  it("renders the conversion rate curve section", () => {
    render(<SimulatorClient {...defaultProps} />);
    expect(screen.getAllByText("Conversion Rate Curve").length).toBeGreaterThan(0);
  });

  it("renders the mint calculator section", () => {
    render(<SimulatorClient {...defaultProps} />);
    expect(screen.getAllByText("Mint Calculator").length).toBeGreaterThan(0);
  });

  it("renders rate milestones table", () => {
    render(<SimulatorClient {...defaultProps} />);
    expect(screen.getAllByText("Rate Milestones").length).toBeGreaterThan(0);
  });

  it("renders the how it works section", () => {
    render(<SimulatorClient {...defaultProps} />);
    expect(screen.getAllByText("How the Conversion Works").length).toBeGreaterThan(0);
  });

  it("shows ATONE input and calculates PHOTON output", () => {
    render(<SimulatorClient {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText("100");
    fireEvent.change(inputs[0], { target: { value: "100" } });
    expect(screen.getAllByText("677.0000").length).toBeGreaterThan(0);
  });

  it("shows arbitrage indicator when input provided", () => {
    render(<SimulatorClient {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText("100");
    fireEvent.change(inputs[0], { target: { value: "100" } });
    expect(screen.getAllByText("Mint vs Buy Arbitrage").length).toBeGreaterThan(0);
  });

  it("renders milestone percentages", () => {
    render(<SimulatorClient {...defaultProps} />);
    expect(screen.getAllByText("10%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("25%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
  });
});
