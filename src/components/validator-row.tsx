import { formatNumber } from "@/lib/format";

interface ValidatorRowProps {
  rank: number;
  moniker: string;
  website: string;
  tokens: number;
  totalBonded: number;
  maxTokens: number;
  commission: number;
  operatorAddress: string;
}

export function ValidatorRow({
  rank,
  moniker,
  website,
  tokens,
  totalBonded,
  maxTokens,
  commission,
  operatorAddress,
}: ValidatorRowProps) {
  const powerPct = (tokens / totalBonded) * 100;
  const barWidth = (tokens / maxTokens) * 100;
  const mintscanUrl = `https://www.mintscan.io/atomone/validators/${operatorAddress}`;

  return (
    <a
      href={mintscanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="grid grid-cols-[2.5rem_1fr_6rem_1fr_4rem] md:grid-cols-[3rem_1fr_8rem_1fr_5rem] items-center gap-2 md:gap-4 py-3 px-3 md:px-4 border-b border-border hover:bg-bg-card-hover transition-colors no-underline group"
    >
      <span
        className={`font-mono text-sm text-center ${
          rank <= 3 ? "text-accent font-bold" : "text-text-muted"
        }`}
      >
        {rank}
      </span>

      <div className="min-w-0">
        <div className="text-sm text-text-primary group-hover:text-accent transition-colors truncate">
          {moniker}
        </div>
        {website && (
          <div className="text-xs text-text-muted truncate hidden md:block">
            {website.replace(/^https?:\/\//, "")}
          </div>
        )}
      </div>

      <span className="text-sm font-mono text-text-secondary text-right">
        {formatNumber(tokens / 1e6, 0)}
      </span>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent/70 rounded-full"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="text-xs font-mono text-text-muted w-12 text-right">
          {powerPct.toFixed(2)}%
        </span>
      </div>

      <span className="text-sm font-mono text-text-muted text-right">
        {commission.toFixed(1)}%
      </span>
    </a>
  );
}
