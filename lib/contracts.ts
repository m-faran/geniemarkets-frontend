import { type Address } from "viem";

// ── Contract Addresses ──────────────────────────────────
export const GENIE_MARKETS_ADDRESS = process.env
  .NEXT_PUBLIC_GENIE_MARKETS_ADDRESS as Address;

export const USDC_ADDRESS = process.env
  .NEXT_PUBLIC_USDC_ADDRESS as Address;

// ── USDC (minimal ERC-20) ABI ───────────────────────────
export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
] as const;

// ── GenieMarkets ABI ────────────────────────────────────
export const genieMarketsAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "vrfCoordinator", type: "address" },
      { name: "subscriptionId", type: "uint256" },
      { name: "keyHash", type: "bytes32" },
      { name: "callbackGasLimit", type: "uint32" },
      { name: "usdc", type: "address" },
      { name: "_openDuration", type: "uint32" },
      { name: "_closeDuration", type: "uint32" },
    ],
    stateMutability: "nonpayable",
  },
  // ── View: constants ──
  {
    type: "function",
    name: "SINGLE_PAYOUT",
    inputs: [],
    outputs: [{ type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "PAIR_PAYOUT",
    inputs: [],
    outputs: [{ type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UNIQUE_TRIO_PAYOUT",
    inputs: [],
    outputs: [{ type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TWIN_TRIO_PAYOUT",
    inputs: [],
    outputs: [{ type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "JACKPOT_TRIO_PAYOUT",
    inputs: [],
    outputs: [{ type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "CLAIM_PERIOD",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "EMERGENCY_TIMEOUT",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  // ── View: state ──
  {
    type: "function",
    name: "s_currentRoundId",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "s_openDuration",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "s_closeDuration",
    inputs: [],
    outputs: [{ type: "uint32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "s_rounds",
    inputs: [{ type: "uint256" }],
    outputs: [
      { name: "phase", type: "uint8" },
      { name: "openCutoff", type: "uint40" },
      { name: "closeCutoff", type: "uint40" },
      { name: "settledAt", type: "uint40" },
      { name: "openVrfRequestId", type: "uint256" },
      { name: "closeVrfRequestId", type: "uint256" },
      { name: "openD1", type: "uint8" },
      { name: "openD2", type: "uint8" },
      { name: "openD3", type: "uint8" },
      { name: "closeD1", type: "uint8" },
      { name: "closeD2", type: "uint8" },
      { name: "closeD3", type: "uint8" },
      { name: "openSingle", type: "uint8" },
      { name: "closeSingle", type: "uint8" },
      { name: "pairResult", type: "uint8" },
    ],
    stateMutability: "view",
  },
  // ── View: helpers ──
  {
    type: "function",
    name: "getRoundBetCount",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBet",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "betIndex", type: "uint256" },
    ],
    outputs: [
      { name: "player", type: "address" },
      { name: "betType", type: "uint8" },
      { name: "pick", type: "uint16" },
      { name: "amount", type: "uint128" },
      { name: "claimed", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkPayout",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "betIndex", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  // ── Write: betting ──
  {
    type: "function",
    name: "placeBet",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "betType", type: "uint8" },
      { name: "pick", type: "uint16" },
      { name: "wagerAmount", type: "uint128" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Write: draws ──
  {
    type: "function",
    name: "requestOpenDraw",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestCloseDraw",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Write: claims ──
  {
    type: "function",
    name: "claimWinnings",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "betIndex", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimRefund",
    inputs: [
      { name: "roundId", type: "uint256" },
      { name: "betIndex", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Write: emergency ──
  {
    type: "function",
    name: "cancelStaleRound",
    inputs: [{ name: "roundId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // ── Events ──
  {
    type: "event",
    name: "BetPlaced",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "betIndex", type: "uint256", indexed: false },
      { name: "player", type: "address", indexed: true },
      { name: "betType", type: "uint8", indexed: false },
      { name: "pick", type: "uint16", indexed: false },
      { name: "amount", type: "uint128", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DrawRequested",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "isClose", type: "bool", indexed: false },
      { name: "vrfRequestId", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DrawFulfilled",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "isClose", type: "bool", indexed: false },
      { name: "d1", type: "uint8", indexed: false },
      { name: "d2", type: "uint8", indexed: false },
      { name: "d3", type: "uint8", indexed: false },
      { name: "single", type: "uint8", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoundSettled",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "pairResult", type: "uint8", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoundPartiallySettled",
    inputs: [{ name: "roundId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoundCancelled",
    inputs: [{ name: "roundId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "WinningsClaimed",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "betIndex", type: "uint256", indexed: false },
      { name: "player", type: "address", indexed: true },
      { name: "payout", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RefundClaimed",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "betIndex", type: "uint256", indexed: false },
      { name: "player", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoundInitialized",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "openCutoff", type: "uint40", indexed: false },
      { name: "closeCutoff", type: "uint40", indexed: false },
    ],
    anonymous: false,
  },
] as const;
