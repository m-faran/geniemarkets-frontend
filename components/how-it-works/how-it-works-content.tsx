"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Dice5,
  Sparkles,
  Trophy,
  HelpCircle,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  Calculator,
  Coins,
  Scale,
  Shuffle,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  PAYOUTS,
  isValidTrio,
} from "@/lib/utils";

// Rank helper according to Genie Math: 0 is rank 10 (highest), 1-9 are 1-9
function getGenieRank(d: number): number {
  return d === 0 ? 10 : d;
}

// Sort 3 digits in Genie order
function sortDigitsGenie(d1: number, d2: number, d3: number): [number, number, number] {
  const arr = [d1, d2, d3];
  arr.sort((a, b) => getGenieRank(a) - getGenieRank(b));
  return [arr[0], arr[1], arr[2]];
}

// Classify Trio
function getTrioClassification(d1: number, d2: number, d3: number): {
  type: "Jackpot" | "Twin" | "Unique";
  payout: number;
  badgeColor: string;
  desc: string;
} {
  if (d1 === d2 && d2 === d3) {
    return {
      type: "Jackpot",
      payout: PAYOUTS.jackpotTrio,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      desc: "All 3 digits identical (10 combinations)",
    };
  }
  if (d1 === d2 || d2 === d3 || d1 === d3) {
    return {
      type: "Twin",
      payout: PAYOUTS.twinTrio,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      desc: "2 identical digits (90 combinations)",
    };
  }
  return {
    type: "Unique",
    payout: PAYOUTS.uniqueTrio,
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    desc: "3 distinct digits (120 combinations)",
  };
}

const FAQS = [
  {
    q: "How does Chainlink VRF guarantee fairness?",
    a: "Every draw requests randomness from Chainlink VRF (Verifiable Random Function) v2.5. The winning numbers are generated using cryptographic proofs onchain that cannot be tampered with or predicted by anyone — including the protocol developers, miners, or validators.",
  },
  {
    q: "Can I place Close Market bets during the Open Market phase?",
    a: "Yes! Close Market bets (Close Single and Close Trio) can be placed at any time from the start of the round until the 24-hour Close Cutoff. You do not need to wait for the Open Market to finish to place your Close bets.",
  },
  {
    q: "Do I need ETH or crypto to pay gas fees?",
    a: "No! All transactions on Genie Markets are 100% gas-sponsored via Privy account abstraction. You never need Sepolia ETH or native gas tokens. You only wager USDC, and winning payouts are transferred directly in USDC.",
  },
  {
    q: "Why is 0 considered the highest digit in Trio bets?",
    a: "Genie Markets follows the Genie Ordering convention: 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0. Zero is ranked as the 10th (highest) digit. This creates unique strategic combinations and ensures clean canonical sorting so picks like '150' are valid (1 < 5 < 0) while '015' must be written as '150'.",
  },
  {
    q: "How long do I have to claim my winnings?",
    a: "You have 30 days from round settlement to claim your winnings or refunds. Claims are pull-based: simply visit the Play page or History page, view your winning bet, and click Claim.",
  },
  {
    q: "What happens if a draw is delayed or VRF gets stuck?",
    a: "Draws are permissionless — any user or operator can trigger the draw once the cutoff time is reached directly from the UI. If a VRF request were ever stuck pending for more than 24 hours, an emergency timeout allows anyone to cancel or partially settle the round so all affected wagers can be refunded in full.",
  },
];

export function HowItWorksContent() {
  // --- Genie-Sort Playground State ---
  const [digit1, setDigit1] = useState<number>(3);
  const [digit2, setDigit2] = useState<number>(0);
  const [digit3, setDigit3] = useState<number>(7);

  const [sortedD1, sortedD2, sortedD3] = useMemo(
    () => sortDigitsGenie(digit1, digit2, digit3),
    [digit1, digit2, digit3]
  );

  const derivedSingle = useMemo(
    () => (sortedD1 + sortedD2 + sortedD3) % 10,
    [sortedD1, sortedD2, sortedD3]
  );

  const trioInfo = useMemo(
    () => getTrioClassification(sortedD1, sortedD2, sortedD3),
    [sortedD1, sortedD2, sortedD3]
  );

  const rawPick = digit1 * 100 + digit2 * 10 + digit3;
  const isRawSorted = isValidTrio(rawPick);

  const rollRandom = () => {
    setDigit1(Math.floor(Math.random() * 10));
    setDigit2(Math.floor(Math.random() * 10));
    setDigit3(Math.floor(Math.random() * 10));
  };

  // --- Interactive Calculator State ---
  const [calcBetType, setCalcBetType] = useState<
    "Single" | "Pair" | "UniqueTrio" | "TwinTrio" | "JackpotTrio"
  >("Single");
  const [calcWager, setCalcWager] = useState<string>("10");

  const calcMultiplier = useMemo(() => {
    switch (calcBetType) {
      case "Single":
        return PAYOUTS[0]; // 9x
      case "Pair":
        return PAYOUTS[4]; // 90x
      case "UniqueTrio":
        return PAYOUTS.uniqueTrio; // 140x
      case "TwinTrio":
        return PAYOUTS.twinTrio; // 280x
      case "JackpotTrio":
        return PAYOUTS.jackpotTrio; // 600x
    }
  }, [calcBetType]);

  const wagerNum = parseFloat(calcWager) || 0;
  const grossPayout = wagerNum * calcMultiplier;
  const netProfit = Math.max(0, grossPayout - wagerNum);

  // --- FAQ open/close state ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-glow-pulse absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="animate-glow-pulse absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl [animation-delay:1.5s]" />
        <div className="animate-glow-pulse absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl [animation-delay:3s]" />
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
          <BookOpen className="h-3.5 w-3.5 text-violet-400" />
          Official Player Guide & Tutorial
        </div>
        <h1 className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          How Genie Markets Works
        </h1>
        <p className="text-base sm:text-lg text-zinc-400">
          Genie Markets is an onchain prediction protocol powered by Chainlink VRF.
          Predict single digits, pairs, or trios across daily rounds with transparent,
          mathematically fair payouts up to{" "}
          <span className="font-semibold text-violet-300">600x</span>.
        </p>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          <a
            href="#quick-start"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            🚀 Quick Start
          </a>
          <a
            href="#game-types"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            🎲 Game Types & Multipliers
          </a>
          <a
            href="#genie-math"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            🧮 Genie Math & Demo
          </a>
          <a
            href="#calculator"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            💰 Payout Calculator
          </a>
          <a
            href="#timeline"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ⏱️ Round Lifecycle
          </a>
          <a
            href="#faq"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ❓ FAQ
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: 5-STEP PLAYING TUTORIAL
      ───────────────────────────────────────────────────────────── */}
      <section id="quick-start" className="space-y-6">
        <div className="text-center sm:text-left">
          <h2 className="flex items-center justify-center sm:justify-start gap-2.5 text-2xl font-bold text-white">
            <Sparkles className="h-6 w-6 text-violet-400" />
            Playing in 5 Easy Steps
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            No seed phrases, zero crypto jargon, and sponsored gas fees.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-bold text-violet-400 ring-1 ring-violet-500/30">
                1
              </span>
              <ShieldCheck className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Sign In & Wallet</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in using your Google or Email account. Privy automatically creates a secure,
              non-custodial embedded wallet for you. No seed phrases to write down.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-bold text-violet-400 ring-1 ring-violet-500/30">
                2
              </span>
              <Coins className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Fund with USDC</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Click <strong className="text-zinc-200">Add Funds</strong> to deposit USDC via credit card or transfer.
              All transactions are gas-sponsored, so you don&apos;t need ETH for gas.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-bold text-violet-400 ring-1 ring-violet-500/30">
                3
              </span>
              <Dice5 className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Pick Your Prediction</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Select between <strong className="text-zinc-200">Open Market</strong> and{" "}
              <strong className="text-zinc-200">Close Market</strong>. Choose a Single digit (0-9), a Pair (00-99),
              or a Trio (3 Genie-sorted digits).
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-bold text-violet-400 ring-1 ring-violet-500/30">
                4
              </span>
              <Zap className="h-5 w-5 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">VRF Provably Fair Draw</h3>
            <p className="mt-2 text-sm text-zinc-400">
              When cutoffs elapse, Chainlink VRF generates certified tamper-proof random numbers.
              Results are published and verifiable directly on the Ethereum blockchain.
            </p>
          </div>

          {/* Step 5 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05] sm:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-sm font-bold text-violet-400 ring-1 ring-violet-500/30">
                5
              </span>
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">Claim Your Winnings</h3>
            <p className="mt-2 text-sm text-zinc-400">
              When a round settles, any player with a winning bet can claim their USDC payout with one click.
              You have <strong className="text-zinc-200">30 days</strong> to claim, and payouts are credited
              directly to your wallet balance.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: GAME TYPES & RETURNS BREAKDOWN
      ───────────────────────────────────────────────────────────── */}
      <section id="game-types" className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Trophy className="h-6 w-6 text-amber-400" />
            Game Types & Return Multipliers
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Genie Markets features 3 distinct game categories offering returns from 9x up to 600x your wager.
          </p>
        </div>

        {/* Detailed Cards for Game Types */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: Single */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 via-white/[0.02] to-transparent p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-violet-600/20 p-2.5 text-violet-400 border border-violet-500/20">
                <Dice5 className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-xs font-bold text-violet-300">
                9x Return
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Single (Open & Close)</h3>
              <p className="text-xs text-zinc-400 mt-1">Available in Open Market & Close Market</p>
            </div>

            <p className="text-sm text-zinc-300">
              Predict a single digit from <strong className="text-white">0 to 9</strong>.
            </p>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Winning Rule:</span>
                <span className="font-mono text-zinc-200">(d1 + d2 + d3) mod 10</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Probability:</span>
                <span className="font-semibold text-emerald-400">1 in 10 (10.0%)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>$10 Wager Pays:</span>
                <span className="font-bold text-violet-300">$90.00 USDC</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Example: VRF draws 3, 5, 6. The sum is 14. 14 mod 10 is <strong>4</strong>.
              If your pick was 4, you win 9x!
            </p>
          </div>

          {/* Card 2: Pair */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-blue-500/10 via-white/[0.02] to-transparent p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-300">
                90x Return
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Pair</h3>
              <p className="text-xs text-zinc-400 mt-1">Placed during Open Market timeframe</p>
            </div>

            <p className="text-sm text-zinc-300">
              Predict a two-digit number from <strong className="text-white">00 to 99</strong>.
            </p>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Winning Rule:</span>
                <span className="font-mono text-zinc-200">Open Single + Close Single</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Probability:</span>
                <span className="font-semibold text-blue-400">1 in 100 (1.0%)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>$10 Wager Pays:</span>
                <span className="font-bold text-blue-300">$900.00 USDC</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Example: Open Single derives to <strong>4</strong> and Close Single derives to <strong>7</strong>.
              The winning Pair is <strong>47</strong>.
            </p>
          </div>

          {/* Card 3: Trio */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-amber-500/10 via-white/[0.02] to-transparent p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-600/20 p-2.5 text-amber-400 border border-amber-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300">
                140x – 600x Return
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Trio (Open & Close)</h3>
              <p className="text-xs text-zinc-400 mt-1">Predict all 3 Genie-sorted digits</p>
            </div>

            <p className="text-sm text-zinc-300">
              Predict the 3 drawn digits sorted in Genie order. Returns depend on digit uniqueness:
            </p>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Unique Trio (3 distinct):</span>
                <span className="font-bold text-amber-300">140x ($1,400 on $10)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Twin Trio (2 identical):</span>
                <span className="font-bold text-amber-300">280x ($2,800 on $10)</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Jackpot Trio (3 identical):</span>
                <span className="font-bold text-amber-300">600x ($6,000 on $10)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500">
              Digits must be entered in valid Genie order: 1 &lt; 2 &lt; ... &lt; 9 &lt; 0.
            </p>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3.5">Game Type</th>
                <th className="px-4 py-3.5">Market</th>
                <th className="px-4 py-3.5">Pick Range</th>
                <th className="px-4 py-3.5">Win Condition</th>
                <th className="px-4 py-3.5">Multiplier</th>
                <th className="px-4 py-3.5 text-right">$10 Wager Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs sm:text-sm">
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Open Single</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open Window</td>
                <td className="px-4 py-3 text-zinc-300">0 – 9</td>
                <td className="px-4 py-3 font-sans text-zinc-400">(d1+d2+d3)%10 matches Open</td>
                <td className="px-4 py-3 font-bold text-violet-400">9x</td>
                <td className="px-4 py-3 text-right font-bold text-white">$90.00</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Close Single</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open & Close Window</td>
                <td className="px-4 py-3 text-zinc-300">0 – 9</td>
                <td className="px-4 py-3 font-sans text-zinc-400">(d1+d2+d3)%10 matches Close</td>
                <td className="px-4 py-3 font-bold text-violet-400">9x</td>
                <td className="px-4 py-3 text-right font-bold text-white">$90.00</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Pair</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open Window</td>
                <td className="px-4 py-3 text-zinc-300">00 – 99</td>
                <td className="px-4 py-3 font-sans text-zinc-400">OpenSingle × 10 + CloseSingle</td>
                <td className="px-4 py-3 font-bold text-blue-400">90x</td>
                <td className="px-4 py-3 text-right font-bold text-white">$900.00</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Unique Trio</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open or Close</td>
                <td className="px-4 py-3 text-zinc-300">Genie-sorted (3 distinct)</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Exact match to 3 sorted digits</td>
                <td className="px-4 py-3 font-bold text-amber-400">140x</td>
                <td className="px-4 py-3 text-right font-bold text-white">$1,400.00</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Twin Trio</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open or Close</td>
                <td className="px-4 py-3 text-zinc-300">Genie-sorted (2 identical)</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Exact match to 3 sorted digits</td>
                <td className="px-4 py-3 font-bold text-purple-400">280x</td>
                <td className="px-4 py-3 text-right font-bold text-white">$2,800.00</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-semibold text-white">Jackpot Trio</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Open or Close</td>
                <td className="px-4 py-3 text-zinc-300">Genie-sorted (3 identical)</td>
                <td className="px-4 py-3 font-sans text-zinc-400">Exact match to 3 sorted digits</td>
                <td className="px-4 py-3 font-bold text-amber-300">600x</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-400">$6,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: THE GENIE-SORT MATH & INTERACTIVE DEMO
      ───────────────────────────────────────────────────────────── */}
      <section id="genie-math" className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Scale className="h-6 w-6 text-purple-400" />
            Genie-Sort Math & Ordering Rule
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            How digits are canonically ordered onchain and how the derived single digit is calculated.
          </p>
        </div>

        {/* Rule explanation alert card */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-base">
            <AlertCircle className="h-5 w-5" />
            The Golden Rule: 0 is the Highest Digit
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            In Genie Markets smart contracts (<code className="font-mono text-purple-300">GenieMath.sol</code>),
            digits are ranked as:
          </p>
          <div className="flex flex-wrap items-center gap-2 py-2 font-mono text-sm sm:text-base">
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">1</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">2</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">3</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">4</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">5</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">6</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">7</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">8</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-black/40 px-3 py-1.5 text-zinc-300 border border-white/10">9</span>
            <span className="text-zinc-500">&lt;</span>
            <span className="rounded-lg bg-purple-600/30 px-3 py-1.5 font-bold text-purple-200 border border-purple-500/40">
              0 (Rank 10)
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Because 0 is highest, any pick with 0 must have 0 at the end (e.g. <strong className="text-zinc-200">1-5-0</strong> or <strong className="text-zinc-200">3-9-0</strong>).
            A pick like <em>0-1-5</em> is invalid and must be submitted as <strong>1-5-0</strong>.
          </p>
        </div>

        {/* Interactive Genie-Sort Simulator Widget */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-violet-400" />
                Interactive Genie-Sort & Derivation Tester
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Choose or roll 3 random digits to see live Genie-sorting, trio categorization, and single digit derivation.
              </p>
            </div>
            <button
              onClick={rollRandom}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Roll Random Draw
            </button>
          </div>

          {/* 3 Input Selectors */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {[
              { val: digit1, setter: setDigit1, label: "Digit 1" },
              { val: digit2, setter: setDigit2, label: "Digit 2" },
              { val: digit3, setter: setDigit3, label: "Digit 3" },
            ].map((d, i) => (
              <div key={i} className="text-center space-y-1.5">
                <label className="text-xs text-zinc-500">{d.label}</label>
                <select
                  value={d.val}
                  onChange={(e) => d.setter(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-black/60 py-3 text-center font-mono text-xl font-bold text-white focus:border-violet-500 focus:outline-none"
                >
                  {Array.from({ length: 10 }, (_, n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Results Display */}
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {/* Box 1: Raw vs Sorted */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2 text-center">
              <span className="text-xs font-medium text-zinc-400">Genie-Sorted Trio</span>
              <div className="flex items-center justify-center gap-2 font-mono text-2xl font-extrabold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {sortedD1}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {sortedD2}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {sortedD3}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Canonical Pick: <strong className="text-zinc-200">{sortedD1}{sortedD2}{sortedD3}</strong>{" "}
                <span className={isRawSorted ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  ({isRawSorted ? "Already Genie-sorted" : "Reordered into Genie rank"})
                </span>
              </p>
            </div>

            {/* Box 2: Trio Classification */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2 text-center">
              <span className="text-xs font-medium text-zinc-400">Trio Category & Payout</span>
              <div className="pt-1">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${trioInfo.badgeColor}`}
                >
                  {trioInfo.type} Trio ({trioInfo.payout}x)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">{trioInfo.desc}</p>
            </div>

            {/* Box 3: Derived Single */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-4 space-y-2 text-center">
              <span className="text-xs font-medium text-zinc-400">Derived Single Digit</span>
              <div className="flex items-center justify-center font-mono text-2xl font-extrabold text-violet-400">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                  {derivedSingle}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                ({sortedD1} + {sortedD2} + {sortedD3}) % 10 = {derivedSingle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: INTERACTIVE PAYOUT & PROFIT CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="calculator" className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Calculator className="h-6 w-6 text-emerald-400" />
            Payout & Return Calculator
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Calculate your potential winnings and net return for any bet type and wager amount.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8 space-y-6">
          {/* Bet Type Picker */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Bet Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "Single" as const, label: "Single", sub: "9x" },
                { id: "Pair" as const, label: "Pair", sub: "90x" },
                { id: "UniqueTrio" as const, label: "Unique Trio", sub: "140x" },
                { id: "TwinTrio" as const, label: "Twin Trio", sub: "280x" },
                { id: "JackpotTrio" as const, label: "Jackpot Trio", sub: "600x" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCalcBetType(item.id)}
                  className={`rounded-xl p-3 text-center transition-all ${
                    calcBetType === item.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25 ring-1 ring-violet-400/50"
                      : "border border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-bold">{item.label}</p>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Wager Input & Quick Chips */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Wager Amount (USDC)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-zinc-500">
                  $
                </span>
                <input
                  type="number"
                  min="0.1"
                  step="1"
                  value={calcWager}
                  onChange={(e) => setCalcWager(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-8 pr-4 py-3 font-mono text-lg text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                {["1", "5", "10", "25", "50", "100"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCalcWager(amt)}
                    className={`flex-1 rounded-xl px-3 py-3 text-xs font-bold transition-all ${
                      calcWager === amt
                        ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/40"
                        : "border border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payout Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-zinc-500">Payout Multiplier</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-violet-400">
                {calcMultiplier}x
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Contract multiplier</p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-zinc-400">Total Payout</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-emerald-400">
                ${grossPayout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-500/80 mt-1">USDC credited to wallet</p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-zinc-400">Net Profit</p>
              <p className="mt-1 font-mono text-2xl font-extrabold text-amber-400">
                +${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-amber-500/80 mt-1">
                {wagerNum > 0 ? `+${((netProfit / wagerNum) * 100).toFixed(0)}% ROI` : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: ROUND LIFECYCLE & TIMELINE
      ───────────────────────────────────────────────────────────── */}
      <section id="timeline" className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <Clock className="h-6 w-6 text-blue-400" />
            The 24-Hour Round Lifecycle
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Each round runs on a predictable dual-window schedule with transparent cutoff checkpoints.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              time: "00:00 – 21:00",
              title: "Open Betting Phase",
              desc: "Betting is open for Open Single, Open Trio, and Pair. You can also place Close Single and Close Trio bets in advance.",
              status: "Active",
              color: "text-green-400 border-green-500/30 bg-green-500/10",
            },
            {
              time: "21:00 Checkpoint",
              title: "Open Cutoff & VRF Draw",
              desc: "Open betting closes. Anyone can trigger the permissionless Open Draw transaction. Chainlink VRF returns a tamper-proof random number that reveals openD1, openD2, openD3, and derives the Open Single digit.",
              status: "Drawing",
              color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
            },
            {
              time: "21:00 – 24:00",
              title: "Close Betting Phase",
              desc: "Open digits are now known to everyone! Betting continues for Close Single and Close Trio until the 24-hour mark.",
              status: "Close Bets Open",
              color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
            },
            {
              time: "24:00 Checkpoint",
              title: "Close Cutoff & Settle Round",
              desc: "Close betting ends. The Close Draw is triggered via Chainlink VRF, revealing closeD1, closeD2, closeD3, deriving Close Single, and calculating the final 2-digit Pair result (openSingle × 10 + closeSingle).",
              status: "Settling",
              color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
            },
            {
              time: "Next 30 Days",
              title: "Settled & Claims Window",
              desc: "The round is Settled! Winners can claim their payouts anytime over the next 30 days directly from the Play page or History page. Meanwhile, the next round immediately initializes.",
              status: "Claims Open",
              color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-zinc-400">{item.time}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${item.color}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white pt-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-white">
            <HelpCircle className="h-6 w-6 text-violet-400" />
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Everything you need to know about odds, claims, security, and protocol rules.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-violet-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Ready to Make Your Prediction?
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          Sign in now, place your bet on the active round, and see if your intuition can land the 600x Jackpot.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500 transition-all"
          >
            Go to Game
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            View Past Rounds
          </Link>
        </div>
      </section>
    </div>
  );
}
