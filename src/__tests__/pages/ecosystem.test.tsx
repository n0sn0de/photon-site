import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EcosystemPage from "@/app/ecosystem/page";

describe("EcosystemPage", () => {
  it("renders the ecosystem title", () => {
    render(<EcosystemPage />);
    expect(screen.getByText("AtomOne ecosystem")).toBeTruthy();
  });

  it("renders wallet section with Keplr", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText("Keplr Wallet").length).toBeGreaterThan(0);
  });

  it("renders explorer section with Mintscan", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText("Mintscan").length).toBeGreaterThan(0);
  });

  it("renders DeFi section with Osmosis", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText("Osmosis DEX").length).toBeGreaterThan(0);
  });

  it("renders community section", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText("AtomOne Telegram").length).toBeGreaterThan(0);
  });

  it("renders developer section", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText(/NosNode/).length).toBeGreaterThan(0);
  });

  it("renders the building CTA", () => {
    render(<EcosystemPage />);
    expect(screen.getAllByText(/Building on AtomOne/).length).toBeGreaterThan(0);
  });
});
