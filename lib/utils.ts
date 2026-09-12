import { formatUnits, parseUnits } from "viem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ── USDC helpers (6 decimals) ───────────────────────────

/** Format a raw USDC bigint into a human-readable string like "12.50" */
export function formatUsdc(raw: bigint): string {
  return formatUnits(raw, 6);
}

/** Format a raw USDC bigint as a dollar string like "$12.50" */
export function formatUsdcDollar(raw: bigint): string {
  const num = Number(formatUnits(raw, 6));
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Parse a human-readable USDC string into raw bigint (6 decimals) */
export function parseUsdc(amount: string): bigint {
  return parseUnits(amount, 6);
}

// ── Round phase labels ──────────────────────────────────

export enum RoundPhase {
  OpenBetting = 0,
  OpenPending = 1,
  CloseBetting = 2,
  ClosePending = 3,
  Settled = 4,
  PartiallySettled = 5,
  Cancelled = 6,
}

export const PHASE_LABELS: Record<RoundPhase, string> = {
  [RoundPhase.OpenBetting]: "Open Betting",
  [RoundPhase.OpenPending]: "Drawing Open...",
  [RoundPhase.CloseBetting]: "Close Betting",
  [RoundPhase.ClosePending]: "Drawing Close...",
  [RoundPhase.Settled]: "Settled",
  [RoundPhase.PartiallySettled]: "Partially Settled",
  [RoundPhase.Cancelled]: "Cancelled",
};

export const PHASE_COLORS: Record<RoundPhase, string> = {
  [RoundPhase.OpenBetting]: "text-green-400",
  [RoundPhase.OpenPending]: "text-yellow-400",
  [RoundPhase.CloseBetting]: "text-blue-400",
  [RoundPhase.ClosePending]: "text-yellow-400",
  [RoundPhase.Settled]: "text-purple-400",
  [RoundPhase.PartiallySettled]: "text-orange-400",
  [RoundPhase.Cancelled]: "text-red-400",
};

// ── Bet type labels ─────────────────────────────────────

export enum BetType {
  OpenSingle = 0,
  CloseSingle = 1,
  OpenTrio = 2,
  CloseTrio = 3,
  Pair = 4,
}

export const BET_TYPE_LABELS: Record<BetType, string> = {
  [BetType.OpenSingle]: "Open Single",
  [BetType.CloseSingle]: "Close Single",
  [BetType.OpenTrio]: "Open Trio",
  [BetType.CloseTrio]: "Close Trio",
  [BetType.Pair]: "Pair",
};

// ── Payout multipliers (match contract constants) ───────

export const PAYOUTS = {
  [BetType.OpenSingle]: 9,
  [BetType.CloseSingle]: 9,
  [BetType.Pair]: 90,
  // Trio payouts depend on trio type — these are the ranges
  uniqueTrio: 140,
  twinTrio: 280,
  jackpotTrio: 600,
} as const;

/** Get the payout multiplier for a trio pick based on its digit pattern */
export function getTrioPayoutMultiplier(pick: number): number {
  const d1 = Math.floor(pick / 100);
  const d2 = Math.floor((pick / 10) % 10);
  const d3 = pick % 10;
  if (d1 === d2 && d2 === d3) return PAYOUTS.jackpotTrio;
  if (d1 === d2 || d2 === d3) return PAYOUTS.twinTrio;
  return PAYOUTS.uniqueTrio;
}

/** Format a pick for display (e.g. Pair '07', Trio '148', Single '3') */
export function formatPick(betType: BetType, pick: number): string {
  if (betType === BetType.OpenSingle || betType === BetType.CloseSingle) {
    return pick.toString();
  }
  if (betType === BetType.Pair) {
    return pick.toString().padStart(2, "0");
  }
  return pick.toString().padStart(3, "0");
}

/** Get potential multiplier for any bet type */
export function getBetPotentialMultiplier(betType: BetType, pick: number): number {
  if (betType === BetType.OpenSingle || betType === BetType.CloseSingle) {
    return PAYOUTS[BetType.OpenSingle];
  }
  if (betType === BetType.Pair) {
    return PAYOUTS[BetType.Pair];
  }
  return getTrioPayoutMultiplier(pick);
}

// ── Genie-sort validation ───────────────────────────────

/** Genie rank: 0 is highest (rank 10), 1-9 map to 1-9 */
function genieRank(d: number): number {
  return d === 0 ? 10 : d;
}

/** Check if a trio pick is valid Genie-sorted order */
export function isValidTrio(pick: number): boolean {
  if (pick < 0 || pick > 999) return false;
  const a = Math.floor(pick / 100);
  const b = Math.floor((pick / 10) % 10);
  const c = pick % 10;
  return genieRank(a) <= genieRank(b) && genieRank(b) <= genieRank(c);
}

// ── General shadcn/ui utility ───────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Truncate address ────────────────────────────────────

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
