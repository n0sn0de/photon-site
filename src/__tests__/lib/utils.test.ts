import { describe, it, expect } from "vitest";
import {
  formatGovStatus,
  getStatusColor,
  getStatusBgColor,
  calcNakamotoCoefficient,
  calcTallyPcts,
} from "@/lib/utils";

describe("formatGovStatus", () => {
  it("maps known statuses", () => {
    expect(formatGovStatus("PROPOSAL_STATUS_PASSED")).toBe("Passed");
    expect(formatGovStatus("PROPOSAL_STATUS_REJECTED")).toBe("Rejected");
    expect(formatGovStatus("PROPOSAL_STATUS_VOTING_PERIOD")).toBe("Voting");
    expect(formatGovStatus("PROPOSAL_STATUS_DEPOSIT_PERIOD")).toBe("Deposit");
    expect(formatGovStatus("PROPOSAL_STATUS_FAILED")).toBe("Failed");
  });

  it("strips prefix for unknown statuses", () => {
    expect(formatGovStatus("PROPOSAL_STATUS_SOMETHING")).toBe("SOMETHING");
  });
});

describe("getStatusColor", () => {
  it("returns success for passed", () => {
    expect(getStatusColor("PROPOSAL_STATUS_PASSED")).toBe("text-success");
  });

  it("returns danger for rejected", () => {
    expect(getStatusColor("PROPOSAL_STATUS_REJECTED")).toBe("text-danger");
  });

  it("returns accent for voting", () => {
    expect(getStatusColor("PROPOSAL_STATUS_VOTING_PERIOD")).toBe("text-accent");
  });
});

describe("getStatusBgColor", () => {
  it("returns success bg for passed", () => {
    expect(getStatusBgColor("PROPOSAL_STATUS_PASSED")).toContain("bg-success");
  });
});

describe("calcNakamotoCoefficient", () => {
  it("calculates minimum validators for 33.4%", () => {
    // 4 validators each at 10%, rest smaller
    const tokens = [100, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 50];
    const nk = calcNakamotoCoefficient(tokens);
    expect(nk).toBe(3); // 300/800 = 37.5% > 33.4%
  });

  it("returns 1 for single dominant validator", () => {
    const tokens = [500, 10, 10, 10, 10];
    const nk = calcNakamotoCoefficient(tokens);
    expect(nk).toBe(1); // 500/540 > 33.4%
  });

  it("returns 0 for empty array", () => {
    expect(calcNakamotoCoefficient([])).toBe(0);
  });
});

describe("calcTallyPcts", () => {
  it("calculates vote percentages", () => {
    const tally = {
      yes_count: "700",
      no_count: "200",
      abstain_count: "100",
      no_with_veto_count: "0",
    };
    const pcts = calcTallyPcts(tally);
    expect(pcts.yes).toBe(70);
    expect(pcts.no).toBe(20);
    expect(pcts.abstain).toBe(10);
    expect(pcts.total).toBe(1000);
    expect(pcts.hasVotes).toBe(true);
  });

  it("handles zero votes", () => {
    const tally = {
      yes_count: "0",
      no_count: "0",
      abstain_count: "0",
      no_with_veto_count: "0",
    };
    const pcts = calcTallyPcts(tally);
    expect(pcts.yes).toBe(0);
    expect(pcts.hasVotes).toBe(false);
  });
});
