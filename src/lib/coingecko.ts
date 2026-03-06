import { COINGECKO_API, COINGECKO_ATONE_ID, COINGECKO_PHOTON_ID, REVALIDATE_PRICES } from "./constants";

export interface PriceData {
  atoneUsd: number | null;
  photonUsd: number | null;
  photon24hChange: number | null;
  photonMcap: number | null;
  atone24hChange: number | null;
  atoneMcap: number | null;
}

export async function fetchPrices(): Promise<PriceData> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/simple/price?ids=${COINGECKO_ATONE_ID},${COINGECKO_PHOTON_ID}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { next: { revalidate: REVALIDATE_PRICES } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();

    return {
      atoneUsd: data[COINGECKO_ATONE_ID]?.usd ?? null,
      photonUsd: data[COINGECKO_PHOTON_ID]?.usd ?? null,
      photon24hChange: data[COINGECKO_PHOTON_ID]?.usd_24h_change ?? null,
      photonMcap: data[COINGECKO_PHOTON_ID]?.usd_market_cap ?? null,
      atone24hChange: data[COINGECKO_ATONE_ID]?.usd_24h_change ?? null,
      atoneMcap: data[COINGECKO_ATONE_ID]?.usd_market_cap ?? null,
    };
  } catch {
    return {
      atoneUsd: null,
      photonUsd: null,
      photon24hChange: null,
      photonMcap: null,
      atone24hChange: null,
      atoneMcap: null,
    };
  }
}
