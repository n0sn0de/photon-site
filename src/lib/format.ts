import { MICRO_MULTIPLIER, PHOTON_MAX_SUPPLY } from "./constants";

/** Format a number with locale separators */
export function formatNumber(n: number | null | undefined, decimals = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Convert micro-unit bigint/number to human-readable token amount */
export function microToToken(micro: number | string): number {
  return Number(micro) / MICRO_MULTIPLIER;
}

/** Format micro-unit amount as token string */
export function formatToken(micro: number | string | null | undefined, decimals = 2): string {
  if (micro === null || micro === undefined) return "—";
  const whole = microToToken(micro);
  return formatNumber(whole, decimals);
}

/** Compact formatting (1.23M, 4.56B, etc.) */
export function formatCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toFixed(0);
}

/** Format USD price */
export function formatUsd(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (n < 0.01 && n > 0) return "$" + n.toFixed(6);
  return "$" + formatNumber(n, decimals);
}

/** Format percentage */
export function formatPct(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(decimals) + "%";
}

/** Calculate PHOTON minted percentage */
export function photonMintedPct(photonSupplyMicro: number | string): number {
  return (microToToken(photonSupplyMicro) / PHOTON_MAX_SUPPLY) * 100;
}

/** Calculate remaining mintable PHOTON */
export function remainingMintable(photonSupplyMicro: number | string): number {
  return PHOTON_MAX_SUPPLY - microToToken(photonSupplyMicro);
}

/** Calculate conversion rate from supplies */
export function calcConversionRate(
  photonSupplyMicro: number | string,
  atoneSupplyMicro: number | string
): number {
  const photonSupply = Number(photonSupplyMicro);
  const atoneSupply = Number(atoneSupplyMicro);
  if (atoneSupply === 0) return 0;
  const maxSupplyMicro = PHOTON_MAX_SUPPLY * MICRO_MULTIPLIER;
  return (maxSupplyMicro - photonSupply) / atoneSupply;
}

/** Calculate mint cost per PHOTON in USD */
export function calcMintCost(atoneUsd: number, conversionRate: number): number {
  if (conversionRate === 0) return 0;
  return atoneUsd / conversionRate;
}

/** Calculate arbitrage: positive = mint saves, negative = buy saves */
export function calcArbitragePct(mintCost: number, buyCost: number): number {
  if (buyCost === 0) return 0;
  return ((buyCost - mintCost) / buyCost) * 100;
}

/** Estimate ATONE burned from photon supply and rate */
export function estimateAtoneBurned(
  photonSupplyMicro: number | string,
  conversionRate: number
): number {
  if (conversionRate === 0) return 0;
  return microToToken(photonSupplyMicro) / conversionRate;
}
