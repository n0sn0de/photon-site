import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValidatorRow } from "@/components/validator-row";

describe("ValidatorRow", () => {
  const defaultProps = {
    rank: 1,
    moniker: "NosNode",
    website: "https://nosnode.com",
    tokens: 5_000_000_000_000,
    totalBonded: 100_000_000_000_000,
    maxTokens: 5_000_000_000_000,
    commission: 5.0,
    operatorAddress: "atonevaloper1abc",
  };

  it("renders validator moniker and rank", () => {
    const { unmount } = render(<ValidatorRow {...defaultProps} />);
    expect(screen.getByText("NosNode")).toBeInTheDocument();
    expect(screen.getAllByText("1")[0]).toBeInTheDocument();
    unmount();
  });

  it("renders commission rate", () => {
    const { unmount } = render(<ValidatorRow {...defaultProps} />);
    expect(screen.getAllByText("5.0%")[0]).toBeInTheDocument();
    unmount();
  });

  it("links to Mintscan", () => {
    const { unmount } = render(<ValidatorRow {...defaultProps} />);
    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toContain("mintscan.io/atomone/validators/atonevaloper1abc");
    unmount();
  });

  it("renders voting power percentage", () => {
    const { unmount } = render(<ValidatorRow {...defaultProps} />);
    expect(screen.getAllByText("5.00%")[0]).toBeInTheDocument();
    unmount();
  });
});
