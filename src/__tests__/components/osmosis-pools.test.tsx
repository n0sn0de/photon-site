import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { OsmosisPools } from "@/components/osmosis-pools";
import type { PoolDisplay } from "@/lib/osmosis-api";

afterEach(cleanup);

const mockPools: PoolDisplay[] = [
  {
    poolId: 3201,
    tokenPair: "PHOTON / OSMO",
    liquidity: 50000,
    poolType: "Concentrated",
    spreadFactor: 0.2,
    denomA: "ibc/D6E02C5...",
    denomB: "uosmo",
  },
  {
    poolId: 2982,
    tokenPair: "PHOTON / ATOM",
    liquidity: 12000,
    poolType: "Concentrated",
    spreadFactor: 0.1,
    denomA: "ibc/D6E02C5...",
    denomB: "ibc/BC26A7A...",
  },
];

describe("OsmosisPools", () => {
  it("renders pool rows", () => {
    render(<OsmosisPools pools={mockPools} photonOsmosisPrice={0.005} />);
    expect(screen.getByText("#3201")).toBeTruthy();
    expect(screen.getByText("#2982")).toBeTruthy();
    expect(screen.getByText("PHOTON / OSMO")).toBeTruthy();
    expect(screen.getByText("PHOTON / ATOM")).toBeTruthy();
  });

  it("shows empty state when no pools", () => {
    render(<OsmosisPools pools={[]} photonOsmosisPrice={null} />);
    expect(screen.getByText("No PHOTON pools found on Osmosis.")).toBeTruthy();
  });

  it("shows photon price when available", () => {
    render(<OsmosisPools pools={mockPools} photonOsmosisPrice={0.005432} />);
    expect(screen.getByText("$0.005432")).toBeTruthy();
  });

  it("links to osmosis pool page", () => {
    render(<OsmosisPools pools={mockPools} photonOsmosisPrice={null} />);
    const links = screen.getAllByText("#3201");
    const link = links[0].closest("a");
    expect(link?.getAttribute("href")).toBe("https://app.osmosis.zone/pool/3201");
  });

  it("displays pool type", () => {
    render(<OsmosisPools pools={mockPools} photonOsmosisPrice={null} />);
    const concentrated = screen.getAllByText("Concentrated");
    expect(concentrated.length).toBe(2);
  });
});
