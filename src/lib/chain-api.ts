import { LCD_BASE, REVALIDATE_CHAIN, PHOTON_DENOM, ATONE_DENOM } from "./constants";

async function fetchLCD<T>(path: string, revalidate = REVALIDATE_CHAIN): Promise<T> {
  const res = await fetch(`${LCD_BASE}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`LCD ${res.status}: ${path}`);
  return res.json();
}

// ===== Types =====

export interface SupplyResponse {
  supply: Array<{ denom: string; amount: string }>;
  pagination: { next_key: string | null; total: string };
}

export interface StakingPoolResponse {
  pool: { bonded_tokens: string; not_bonded_tokens: string };
}

export interface ConversionRateResponse {
  conversion_rate: string;
}

export interface ValidatorResponse {
  validators: Array<{
    operator_address: string;
    tokens: string;
    description: { moniker: string; website: string; details: string };
    commission: { commission_rates: { rate: string; max_rate: string; max_change_rate: string } };
    status: string;
  }>;
  pagination: { next_key: string | null; total: string };
}

export interface ProposalResponse {
  proposals: Array<{
    id: string;
    title: string;
    status: string;
    voting_end_time: string;
    submit_time: string;
    final_tally_result: {
      yes_count: string;
      no_count: string;
      abstain_count: string;
      no_with_veto_count: string;
    };
  }>;
}

export interface CommunityPoolResponse {
  pool: Array<{ denom: string; amount: string }>;
}

export interface BlockResponse {
  block: {
    header: {
      height: string;
      time: string;
      chain_id: string;
    };
  };
}

// ===== Data Fetching =====

export async function fetchSupply() {
  const page1 = await fetchLCD<SupplyResponse>(
    "/cosmos/bank/v1beta1/supply?pagination.limit=20"
  );

  const supplies = page1.supply || [];
  let uatone = supplies.find((s) => s.denom === ATONE_DENOM);
  let uphoton = supplies.find((s) => s.denom === PHOTON_DENOM);

  // Photon might be on next page
  if (!uphoton && page1.pagination?.next_key) {
    try {
      const page2 = await fetchLCD<SupplyResponse>(
        `/cosmos/bank/v1beta1/supply?pagination.key=${encodeURIComponent(page1.pagination.next_key)}&pagination.limit=10`
      );
      uphoton = (page2.supply || []).find((s) => s.denom === PHOTON_DENOM);
      if (!uatone) {
        uatone = (page2.supply || []).find((s) => s.denom === ATONE_DENOM);
      }
    } catch {
      // ignore pagination errors
    }
  }

  return {
    atoneSupply: uatone?.amount || "0",
    photonSupply: uphoton?.amount || "0",
  };
}

export async function fetchStakingPool() {
  const res = await fetchLCD<StakingPoolResponse>("/cosmos/staking/v1beta1/pool");
  return {
    bondedTokens: res.pool.bonded_tokens,
    notBondedTokens: res.pool.not_bonded_tokens,
  };
}

export async function fetchConversionRate() {
  const res = await fetchLCD<ConversionRateResponse>("/atomone/photon/v1/conversion_rate");
  return parseFloat(res.conversion_rate);
}

export async function fetchValidators(limit = 100) {
  const res = await fetchLCD<ValidatorResponse>(
    `/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=${limit}`
  );
  return (res.validators || []).sort(
    (a, b) => parseInt(b.tokens) - parseInt(a.tokens)
  );
}

export async function fetchProposals(limit = 20) {
  const res = await fetchLCD<ProposalResponse>(
    `/atomone/gov/v1/proposals?pagination.reverse=true&pagination.limit=${limit}`
  );
  return res.proposals || [];
}

export async function fetchVotingProposals() {
  try {
    const res = await fetchLCD<ProposalResponse>(
      "/atomone/gov/v1/proposals?proposal_status=PROPOSAL_STATUS_VOTING_PERIOD"
    );
    return res.proposals || [];
  } catch {
    return [];
  }
}

export async function fetchCommunityPool() {
  const res = await fetchLCD<CommunityPoolResponse>(
    "/cosmos/distribution/v1beta1/community_pool"
  );
  const pool = res.pool || [];
  const uatone = pool.find((p) => p.denom === ATONE_DENOM);
  const uphoton = pool.find((p) => p.denom === PHOTON_DENOM);
  return {
    atone: uatone ? parseFloat(uatone.amount) / 1e6 : 0,
    photon: uphoton ? parseFloat(uphoton.amount) / 1e6 : 0,
  };
}

export async function fetchLatestBlock() {
  const res = await fetchLCD<BlockResponse>(
    "/cosmos/base/tendermint/v1beta1/blocks/latest",
    10
  );
  return {
    height: res.block.header.height,
    time: res.block.header.time,
    chainId: res.block.header.chain_id,
  };
}

/** Fetch all chain data in parallel for SSR */
export async function fetchAllChainData() {
  const [supply, pool, rate, block] = await Promise.allSettled([
    fetchSupply(),
    fetchStakingPool(),
    fetchConversionRate(),
    fetchLatestBlock(),
  ]);

  return {
    supply: supply.status === "fulfilled" ? supply.value : null,
    pool: pool.status === "fulfilled" ? pool.value : null,
    conversionRate: rate.status === "fulfilled" ? rate.value : null,
    block: block.status === "fulfilled" ? block.value : null,
  };
}
