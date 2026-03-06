import type { PoolDisplay } from "@/lib/osmosis-api";
import { formatCompact } from "@/lib/format";

interface OsmosisPoolsProps {
  pools: PoolDisplay[];
  photonOsmosisPrice: number | null;
}

export function OsmosisPools({ pools, photonOsmosisPrice }: OsmosisPoolsProps) {
  if (pools.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-6 text-center text-text-muted text-sm">
        No PHOTON pools found on Osmosis.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price badge */}
      {photonOsmosisPrice !== null && (
        <div className="flex items-center gap-2 text-sm font-mono">
          <img src="/assets/photon.svg" alt="PHOTON" className="w-5 h-5" />
          <span className="text-text-muted">PHOTON on Osmosis:</span>
          <span className="text-accent font-medium">
            ${photonOsmosisPrice < 0.01 ? photonOsmosisPrice.toFixed(6) : photonOsmosisPrice.toFixed(4)}
          </span>
        </div>
      )}

      {/* Pools table */}
      <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[4rem_1fr_6rem_7rem_4.5rem] md:grid-cols-[5rem_1fr_8rem_8rem_5rem] gap-2 md:gap-4 py-3 px-3 md:px-4 border-b border-border text-xs font-mono text-text-muted uppercase tracking-wider">
          <span>Pool</span>
          <span>Pair</span>
          <span className="text-right">Liquidity</span>
          <span className="text-right">Type</span>
          <span className="text-right">Spread</span>
        </div>

        {/* Rows */}
        {pools.map((pool) => (
          <a
            key={pool.poolId}
            href={`https://app.osmosis.zone/pool/${pool.poolId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="grid grid-cols-[4rem_1fr_6rem_7rem_4.5rem] md:grid-cols-[5rem_1fr_8rem_8rem_5rem] items-center gap-2 md:gap-4 py-3 px-3 md:px-4 border-b border-border hover:bg-bg-card-hover transition-colors no-underline group"
          >
            <span className="text-sm font-mono text-accent">
              #{pool.poolId}
            </span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-text-primary group-hover:text-accent transition-colors truncate">
                {pool.tokenPair}
              </span>
            </div>

            <span className="text-sm font-mono text-text-secondary text-right">
              {pool.liquidity > 0 ? "$" + formatCompact(pool.liquidity) : "—"}
            </span>

            <span className="text-xs font-mono text-text-muted text-right">
              {pool.poolType}
            </span>

            <span className="text-xs font-mono text-text-muted text-right">
              {pool.spreadFactor.toFixed(2)}%
            </span>
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Data from{" "}
        <a href="https://sqs.osmosis.zone" target="_blank">
          Osmosis SQS
        </a>{" "}
        — refreshes every 60s
      </div>
    </div>
  );
}
