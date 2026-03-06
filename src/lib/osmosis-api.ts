import { REVALIDATE_PRICES } from "./constants";

const SQS_BASE = "https://sqs.osmosis.zone";
const PHOTON_IBC_DENOM =
  "ibc/D6E02C5AE8A37FC2E3AB1FC8AC168878ADB870549383DFFEA9FD020C234520A7";

export interface OsmosisPool {
  pool_id: number;
  type: number; // 0 = classic, 2 = concentrated liquidity
  spread_factor: string;
  liquidity_cap: string;
  liquidity_cap_error: string;
  denoms: string[];
}

export interface PoolDisplay {
  poolId: number;
  tokenPair: string;
  liquidity: number;
  poolType: string;
  spreadFactor: number;
  denomA: string;
  denomB: string;
}

interface TokenMetadata {
  chain_denom: string;
  human_denom: string;
  precision: number;
}

interface TokenPriceResponse {
  [denom: string]: {
    price: number;
  };
}

export async function fetchPhotonPools(): Promise<PoolDisplay[]> {
  try {
    const poolsRes = await fetch(
      `${SQS_BASE}/pools?denoms=${PHOTON_IBC_DENOM}&min_liquidity=0`,
      { next: { revalidate: REVALIDATE_PRICES } }
    );
    if (!poolsRes.ok) return [];

    const poolsRaw: any[] = await poolsRes.json();

    // Collect all unique denoms for metadata
    const allDenoms = new Set<string>();
    const pools: Array<{
      poolId: number;
      type: number;
      spreadFactor: string;
      liquidity: string;
      denoms: string[];
    }> = [];

    for (const pool of poolsRaw) {
      const poolId =
        pool.pool_id ||
        pool.pool?.id ||
        pool.pool?.["@type"]?.includes("concentrated")
          ? pool.pool?.id
          : null;
      const id = parseInt(poolId || pool.chain_model?.pool?.id || "0");
      if (!id) continue;

      const spreadFactor =
        pool.spread_factor ||
        pool.pool?.spread_factor ||
        pool.pool_model?.spread_factor ||
        "0";
      const liquidity = pool.liquidity_cap || pool.total_value_locked_uosmo || "0";

      // Get denoms from pool data
      const denoms: string[] = [];
      if (pool.denoms && Array.isArray(pool.denoms)) {
        denoms.push(...pool.denoms);
      } else if (pool.pool?.pool_liquidity) {
        for (const coin of pool.pool.pool_liquidity) {
          denoms.push(coin.denom);
        }
      } else if (pool.pool?.token0 || pool.pool?.token1) {
        if (pool.pool.token0) denoms.push(pool.pool.token0);
        if (pool.pool.token1) denoms.push(pool.pool.token1);
      }

      for (const d of denoms) allDenoms.add(d);

      const type = pool.type ?? (pool.pool?.["@type"]?.includes("concentrated") ? 2 : 0);

      pools.push({ poolId: id, type, spreadFactor, liquidity, denoms });
    }

    // Fetch metadata for all denoms
    const denomsParam = Array.from(allDenoms).join(",");
    let metadataMap: Record<string, string> = {};

    if (denomsParam) {
      try {
        const metaRes = await fetch(
          `${SQS_BASE}/tokens/metadata?denoms=${encodeURIComponent(denomsParam)}`,
          { next: { revalidate: 300 } }
        );
        if (metaRes.ok) {
          const metaData: TokenMetadata[] = await metaRes.json();
          for (const m of metaData) {
            metadataMap[m.chain_denom] = m.human_denom?.toUpperCase() || shortenDenom(m.chain_denom);
          }
        }
      } catch {
        // fallback to shortened denoms
      }
    }

    // Build display objects
    const results: PoolDisplay[] = pools.map((p) => {
      const denomA = p.denoms[0] || "";
      const denomB = p.denoms[1] || "";
      const nameA = metadataMap[denomA] || shortenDenom(denomA);
      const nameB = metadataMap[denomB] || shortenDenom(denomB);

      return {
        poolId: p.poolId,
        tokenPair: `${nameA} / ${nameB}`,
        liquidity: parseFloat(p.liquidity) || 0,
        poolType: p.type === 2 ? "Concentrated" : p.type === 0 ? "Classic" : `Type ${p.type}`,
        spreadFactor: parseFloat(p.spreadFactor) * 100,
        denomA,
        denomB,
      };
    });

    // Sort by liquidity descending
    results.sort((a, b) => b.liquidity - a.liquidity);
    return results;
  } catch {
    return [];
  }
}

export async function fetchPhotonPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      `${SQS_BASE}/tokens/prices?base=${PHOTON_IBC_DENOM}`,
      { next: { revalidate: REVALIDATE_PRICES } }
    );
    if (!res.ok) return null;
    const data: TokenPriceResponse = await res.json();
    const entry = data[PHOTON_IBC_DENOM];
    return entry?.price ?? null;
  } catch {
    return null;
  }
}

function shortenDenom(denom: string): string {
  if (denom.startsWith("ibc/")) {
    return "IBC/" + denom.slice(4, 10);
  }
  if (denom.startsWith("u")) {
    return denom.slice(1).toUpperCase();
  }
  return denom.toUpperCase();
}
