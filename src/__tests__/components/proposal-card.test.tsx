import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProposalCard } from "@/components/proposal-card";

const mockProposal = {
  id: "8",
  title: "AtomOne v2 Upgrade",
  status: "PROPOSAL_STATUS_PASSED",
  voting_end_time: "2025-05-15T00:00:00Z",
  final_tally_result: {
    yes_count: "9997",
    no_count: "2",
    abstain_count: "1",
    no_with_veto_count: "0",
  },
};

describe("ProposalCard", () => {
  it("renders proposal title and ID", () => {
    const { unmount } = render(<ProposalCard proposal={mockProposal} />);
    expect(screen.getByText("AtomOne v2 Upgrade")).toBeInTheDocument();
    expect(screen.getByText(/^#8/)).toBeInTheDocument();
    unmount();
  });

  it("renders status badge", () => {
    const { unmount } = render(<ProposalCard proposal={mockProposal} />);
    expect(screen.getAllByText("Passed")[0]).toBeInTheDocument();
    unmount();
  });

  it("links to gov.atom.one", () => {
    const { unmount } = render(<ProposalCard proposal={mockProposal} />);
    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toBe("https://gov.atom.one/proposals/8");
    expect(links[0].getAttribute("target")).toBe("_blank");
    unmount();
  });

  it("shows yes percentage when votes exist", () => {
    const { unmount } = render(<ProposalCard proposal={mockProposal} />);
    expect(screen.getAllByText(/Yes 100%/)[0]).toBeInTheDocument();
    unmount();
  });

  it("handles proposal with no votes", () => {
    const noVotes = {
      ...mockProposal,
      status: "PROPOSAL_STATUS_DEPOSIT_PERIOD",
      final_tally_result: {
        yes_count: "0",
        no_count: "0",
        abstain_count: "0",
        no_with_veto_count: "0",
      },
    };
    const { unmount } = render(<ProposalCard proposal={noVotes} />);
    expect(screen.getAllByText("Deposit")[0]).toBeInTheDocument();
    unmount();
  });
});
