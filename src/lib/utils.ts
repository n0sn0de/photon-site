import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format governance proposal status to human-readable */
export function formatGovStatus(status: string): string {
  const map: Record<string, string> = {
    PROPOSAL_STATUS_PASSED: "Passed",
    PROPOSAL_STATUS_REJECTED: "Rejected",
    PROPOSAL_STATUS_VOTING_PERIOD: "Voting",
    PROPOSAL_STATUS_DEPOSIT_PERIOD: "Deposit",
    PROPOSAL_STATUS_FAILED: "Failed",
  };
  return map[status] || status.replace("PROPOSAL_STATUS_", "");
}

/** Get CSS class for governance status */
export function getStatusColor(status: string): string {
  if (status.includes("PASSED")) return "text-success";
  if (status.includes("REJECTED") || status.includes("FAILED")) return "text-danger";
  if (status.includes("VOTING")) return "text-accent";
  if (status.includes("DEPOSIT")) return "text-warning";
  return "text-text-secondary";
}

/** Get background class for governance status badge */
export function getStatusBgColor(status: string): string {
  if (status.includes("PASSED")) return "bg-success/20 text-success";
  if (status.includes("REJECTED") || status.includes("FAILED")) return "bg-danger/20 text-danger";
  if (status.includes("VOTING")) return "bg-accent/20 text-accent";
  if (status.includes("DEPOSIT")) return "bg-warning/20 text-warning";
  return "bg-text-muted/20 text-text-secondary";
}

/** Calculate Nakamoto coefficient from sorted validator tokens */
export function calcNakamotoCoefficient(validatorTokens: number[]): number {
  const total = validatorTokens.reduce((sum, t) => sum + t, 0);
  if (total === 0) return 0;

  let cumulative = 0;
  for (let i = 0; i < validatorTokens.length; i++) {
    cumulative += validatorTokens[i];
    if (cumulative / total > 0.334) return i + 1;
  }
  return validatorTokens.length;
}

/** Calculate vote tally percentages */
export function calcTallyPcts(tally: {
  yes_count: string;
  no_count: string;
  abstain_count: string;
  no_with_veto_count: string;
}) {
  const yes = parseInt(tally.yes_count || "0");
  const no = parseInt(tally.no_count || "0");
  const abstain = parseInt(tally.abstain_count || "0");
  const veto = parseInt(tally.no_with_veto_count || "0");
  const total = yes + no + abstain + veto;

  return {
    yes: total > 0 ? (yes / total) * 100 : 0,
    no: total > 0 ? (no / total) * 100 : 0,
    abstain: total > 0 ? (abstain / total) * 100 : 0,
    veto: total > 0 ? (veto / total) * 100 : 0,
    total,
    hasVotes: total > 0,
  };
}
