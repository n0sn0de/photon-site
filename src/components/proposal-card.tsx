import { formatGovStatus, getStatusBgColor, calcTallyPcts } from "@/lib/utils";

interface Proposal {
  id: string;
  title: string;
  status: string;
  voting_end_time: string;
  final_tally_result: {
    yes_count: string;
    no_count: string;
    abstain_count: string;
    no_with_veto_count: string;
  };
}

export function ProposalCard({ proposal }: { proposal: Proposal }) {
  const status = formatGovStatus(proposal.status);
  const statusClass = getStatusBgColor(proposal.status);
  const endDate = proposal.voting_end_time
    ? new Date(proposal.voting_end_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const tally = calcTallyPcts(proposal.final_tally_result);

  return (
    <a
      href={`https://gov.atom.one/proposals/${proposal.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-bg-card rounded-xl border border-border p-5 transition-all hover:border-border-accent hover:bg-bg-card-hover no-underline group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-primary font-medium group-hover:text-accent transition-colors truncate">
            {proposal.title || "Untitled Proposal"}
          </div>
          <div className="text-xs text-text-muted mt-1 font-mono">
            #{proposal.id} · {endDate}
            {tally.hasVotes && ` · Yes ${tally.yes.toFixed(0)}%`}
          </div>
        </div>
        <span
          className={`text-xs font-mono px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass}`}
        >
          {status}
        </span>
      </div>

      {tally.hasVotes && (
        <div className="tally-bar">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${tally.yes}%` }}
            title={`Yes: ${tally.yes.toFixed(1)}%`}
          />
          <div
            className="h-full bg-danger transition-all"
            style={{ width: `${tally.no}%` }}
            title={`No: ${tally.no.toFixed(1)}%`}
          />
          <div
            className="h-full bg-text-muted/50 transition-all"
            style={{ width: `${tally.abstain}%` }}
            title={`Abstain: ${tally.abstain.toFixed(1)}%`}
          />
          {tally.veto > 0 && (
            <div
              className="h-full bg-warning transition-all"
              style={{ width: `${tally.veto}%` }}
              title={`No w/ Veto: ${tally.veto.toFixed(1)}%`}
            />
          )}
        </div>
      )}
    </a>
  );
}
