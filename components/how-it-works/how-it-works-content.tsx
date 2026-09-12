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
  Rocket,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAYOUTS, isValidTrio } from "@/lib/utils";

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
  badgeClass: string;
  desc: string;
} {
  if (d1 === d2 && d2 === d3) {
    return {
      type: "Jackpot",
      payout: PAYOUTS.jackpotTrio,
      badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      desc: "All 3 digits identical (10 combinations)",
    };
  }
  if (d1 === d2 || d2 === d3 || d1 === d3) {
    return {
      type: "Twin",
      payout: PAYOUTS.twinTrio,
      badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
      desc: "2 identical digits (90 combinations)",
    };
  }
  return {
    type: "Unique",
    payout: PAYOUTS.uniqueTrio,
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
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
    a: "Yes. Close Market bets (Close Single and Close Trio) can be placed at any time from the start of the round until the 24-hour Close Cutoff. You do not need to wait for the Open Market to finish to place your Close bets.",
  },
  {
    q: "Do I need ETH or crypto to pay gas fees?",
    a: "No. All transactions on Genie Markets are 100% gas-sponsored via Privy account abstraction. You never need Sepolia ETH or native gas tokens. You only wager USDC, and winning payouts are transferred directly in USDC.",
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

const STEPS = [
  {
    step: "01",
    title: "Sign In & Wallet Setup",
    desc: "Sign in with Google or email. Privy creates a secure non-custodial embedded wallet instantly without seed phrases.",
    icon: ShieldCheck,
    badges: ["No Seed Phrase", "Instant Onboarding"],
  },
  {
    step: "02",
    title: "Fund with USDC",
    desc: "Deposit USDC via credit card or transfer. All transactions are gas-sponsored, requiring zero ETH for gas fees.",
    icon: Coins,
    badges: ["Sponsored Gas", "USDC Native"],
  },
  {
    step: "03",
    title: "Pick Your Prediction",
    desc: "Choose Open or Close Market. Predict Single digits (0-9), Pairs (00-99), or Genie-sorted Trios.",
    icon: Dice5,
    badges: ["9x to 600x", "Genie Ordering"],
  },
  {
    step: "04",
    title: "Chainlink VRF Draw",
    desc: "When cutoffs elapse, Chainlink VRF generates certified tamper-proof random numbers directly onchain.",
    icon: Zap,
    badges: ["Provably Fair", "Verifiable Onchain"],
  },
  {
    step: "05",
    title: "Claim Your Winnings",
    desc: "When rounds settle, winning bets claim USDC payouts with one click within 30 days directly to your wallet.",
    icon: Trophy,
    badges: ["Pull-Based Claims", "30-Day Window"],
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
        <Badge
          variant="outline"
          className="gap-1.5 border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300"
        >
          <BookOpen className="h-3.5 w-3.5 text-violet-400" />
          Official Player Guide & Protocol Rules
        </Badge>

        <h1 className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          How Genie Markets Works
        </h1>
        <p className="text-base sm:text-lg text-zinc-400">
          Genie Markets is an onchain prediction protocol powered by Chainlink VRF.
          Predict single digits, pairs, or trios across daily rounds with transparent,
          mathematically fair payouts up to{" "}
          <span className="font-mono font-bold tabular-nums text-violet-300">600x</span>.
        </p>

        {/* Quick Nav Jump Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 pb-2 max-w-4xl mx-auto">
          <a href="#quick-start">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <Rocket className="h-4 w-4 text-violet-400" />
              <span>Quick Start</span>
            </Button>
          </a>
          <a href="#game-types">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <Dice5 className="h-4 w-4 text-violet-400" />
              <span>Game Types & Multipliers</span>
            </Button>
          </a>
          <a href="#genie-math">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <Scale className="h-4 w-4 text-violet-400" />
              <span>Genie Math & Demo</span>
            </Button>
          </a>
          <a href="#calculator">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <Calculator className="h-4 w-4 text-violet-400" />
              <span>Payout Calculator</span>
            </Button>
          </a>
          <a href="#timeline">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <Clock className="h-4 w-4 text-violet-400" />
              <span>Round Lifecycle</span>
            </Button>
          </a>
          <a href="#faq">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-800/90 hover:text-white shadow-sm hover:shadow-md hover:shadow-violet-500/10 transition-all cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-violet-400" />
              <span>FAQ</span>
            </Button>
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: 5-STEP PLAYING TUTORIAL (Connected Stepper / Timeline)
      ───────────────────────────────────────────────────────────── */}
      <section id="quick-start" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-md shadow-violet-500/10 shrink-0">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                Playing in 5 Easy Steps
              </h2>
              <p className="text-sm sm:text-base text-zinc-400">
                No seed phrases, zero crypto jargon, and sponsored gas fees.
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Zero Gas Fees
          </Badge>
        </div>

        {/* 5-Step Connected Timeline / Stepper: 3 in Row 1, 2 Centered in Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            // Step 0, 1, 2 (01, 02, 03) -> span 2 columns (fill Row 1)
            // Step 3 (04) -> starts at col 2 and spans 2 columns (centered in Row 2)
            // Step 4 (05) -> spans 2 columns (occupies cols 4-5)
            const gridColClass =
              index === 3
                ? "md:col-start-2 md:col-span-2"
                : "md:col-span-2";

            return (
              <div key={s.step} className={`${gridColClass} flex`}>
                <Card className="group relative w-full bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all duration-300 p-7 space-y-5 rounded-2xl shadow-xl shadow-black/30 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs font-bold px-3 py-1 bg-zinc-800/90 border border-zinc-700/80 text-zinc-100"
                      >
                        Step {s.step}
                      </Badge>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm shadow-violet-500/10 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold text-white tracking-tight">
                        {s.title}
                      </CardTitle>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800/80">
                    {s.badges.map((b, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs font-mono px-3 py-1 border-zinc-800 bg-zinc-950/60 text-zinc-300 font-medium"
                      >
                        {b}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: GAME TYPES & RETURNS BREAKDOWN
      ───────────────────────────────────────────────────────────── */}
      <section id="game-types" className="space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10 shrink-0">
            <Trophy className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Game Types & Return Multipliers
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Genie Markets features 3 distinct game categories offering returns from 9x up to 600x your wager.
            </p>
          </div>
        </div>

        {/* Game Types: 2 in Row 1, 1 Centered in Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Single (spans cols 1-2) */}
          <div className="md:col-span-2 flex">
            <Card className="group relative w-full bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 hover:border-violet-500/40 hover:bg-zinc-900/80 transition-all duration-300 p-7 space-y-5 rounded-2xl shadow-xl shadow-black/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm shadow-violet-500/10 transition-transform duration-300 group-hover:scale-105">
                    <Dice5 className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-violet-500/40 bg-violet-500/20 text-violet-200 font-mono font-bold tabular-nums text-xs px-3.5 py-1 shadow-xs">
                    9x Return
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-xl font-bold text-white tracking-tight">Single (Open & Close)</CardTitle>
                  <p className="text-xs text-zinc-400 mt-1">Available in Open Market & Close Market</p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Predict a single digit from <strong className="text-white font-mono">0 to 9</strong>.
                </p>

                <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Winning Rule:</span>
                    <span className="font-mono text-zinc-200">(d1 + d2 + d3) mod 10</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Probability:</span>
                    <span className="font-mono font-semibold text-emerald-400">1 in 10 (10.0%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>$10 Wager Pays:</span>
                    <span className="font-mono font-bold text-violet-300">$90.00 USDC</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
                Example: VRF draws 3, 5, 6. The sum is 14. 14 mod 10 is <strong className="text-zinc-200">4</strong>.
                If your pick was 4, you win 9x.
              </p>
            </Card>
          </div>

          {/* Card 2: Pair (spans cols 3-4) */}
          <div className="md:col-span-2 flex">
            <Card className="group relative w-full bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 hover:border-blue-500/40 hover:bg-zinc-900/80 transition-all duration-300 p-7 space-y-5 rounded-2xl shadow-xl shadow-black/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10 transition-transform duration-300 group-hover:scale-105">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-blue-500/40 bg-blue-500/20 text-blue-200 font-mono font-bold tabular-nums text-xs px-3.5 py-1 shadow-xs">
                    90x Return
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-xl font-bold text-white tracking-tight">Pair</CardTitle>
                  <p className="text-xs text-zinc-400 mt-1">Placed during Open Market timeframe</p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Predict a two-digit number from <strong className="text-white font-mono">00 to 99</strong>.
                </p>

                <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Winning Rule:</span>
                    <span className="font-mono text-zinc-200">Open Single + Close Single</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Probability:</span>
                    <span className="font-mono font-semibold text-blue-400">1 in 100 (1.0%)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>$10 Wager Pays:</span>
                    <span className="font-mono font-bold text-blue-300">$900.00 USDC</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
                Example: Open Single derives to <strong className="text-zinc-200">4</strong> and Close Single derives to <strong className="text-zinc-200">7</strong>.
                The winning Pair is <strong className="text-zinc-200">47</strong>.
              </p>
            </Card>
          </div>

          {/* Card 3: Trio (Centered in row 2: md:col-start-2 md:col-span-2) */}
          <div className="md:col-start-2 md:col-span-2 flex">
            <Card className="group relative w-full bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 hover:border-amber-500/40 hover:bg-zinc-900/80 transition-all duration-300 p-7 space-y-5 rounded-2xl shadow-xl shadow-black/30 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600/15 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10 transition-transform duration-300 group-hover:scale-105">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/20 text-amber-200 font-mono font-bold tabular-nums text-xs px-3.5 py-1 shadow-xs">
                    140x – 600x Return
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-xl font-bold text-white tracking-tight">Trio (Open & Close)</CardTitle>
                  <p className="text-xs text-zinc-400 mt-1">Predict all 3 Genie-sorted digits</p>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  Predict the 3 drawn digits sorted in Genie order. Returns depend on digit uniqueness:
                </p>

                <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Unique Trio (3 distinct):</span>
                    <span className="font-mono font-bold text-amber-300 tabular-nums">140x ($1,400 on $10)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Twin Trio (2 identical):</span>
                    <span className="font-mono font-bold text-amber-300 tabular-nums">280x ($2,800 on $10)</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Jackpot Trio (3 identical):</span>
                    <span className="font-mono font-bold text-amber-300 tabular-nums">600x ($6,000 on $10)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 pt-3 border-t border-zinc-800/80">
                Digits must be entered in valid Genie order: 1 &lt; 2 &lt; ... &lt; 9 &lt; 0.
              </p>
            </Card>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800/90 bg-zinc-900/40 shadow-xl shadow-black/30">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800/90 bg-zinc-900/90 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Game Type</th>
                <th className="px-6 py-4">Market</th>
                <th className="px-6 py-4">Pick Range</th>
                <th className="px-6 py-4">Win Condition</th>
                <th className="px-6 py-4">Multiplier</th>
                <th className="px-6 py-4 text-right">$10 Wager Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-xs sm:text-sm">
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Open Single</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open Window</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">0 – 9</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">(d1+d2+d3)%10 matches Open</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 tabular-nums">
                    9x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-bold text-white tabular-nums text-base">$90.00</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Close Single</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open & Close Window</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">0 – 9</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">(d1+d2+d3)%10 matches Close</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 tabular-nums">
                    9x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-bold text-white tabular-nums text-base">$90.00</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Pair</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open Window</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">00 – 99</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">OpenSingle × 10 + CloseSingle</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 tabular-nums">
                    90x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-bold text-white tabular-nums text-base">$900.00</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Unique Trio</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open or Close</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">Genie-sorted (3 distinct)</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">Exact match to 3 sorted digits</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 tabular-nums">
                    140x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-bold text-white tabular-nums text-base">$1,400.00</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Twin Trio</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open or Close</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">Genie-sorted (2 identical)</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">Exact match to 3 sorted digits</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 tabular-nums">
                    280x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-bold text-white tabular-nums text-base">$2,800.00</td>
              </tr>
              <tr className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-6 py-4.5 font-sans font-bold text-white text-base">Jackpot Trio</td>
                <td className="px-6 py-4.5 font-sans text-zinc-300">Open or Close</td>
                <td className="px-6 py-4.5 text-zinc-300 tabular-nums font-semibold">Genie-sorted (3 identical)</td>
                <td className="px-6 py-4.5 font-sans text-zinc-400 font-mono text-xs">Exact match to 3 sorted digits</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-sm shadow-emerald-500/20 tabular-nums">
                    600x
                  </span>
                </td>
                <td className="px-6 py-4.5 text-right font-extrabold text-emerald-400 tabular-nums text-base shadow-sm">$6,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: THE GENIE-SORT MATH & INTERACTIVE DEMO
      ───────────────────────────────────────────────────────────── */}
      <section id="genie-math" className="space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-md shadow-purple-500/10 shrink-0">
            <Scale className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Genie-Sort Math & Ordering Rule
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              How digits are canonically ordered onchain and how the derived single digit is calculated.
            </p>
          </div>
        </div>

        {/* Rule explanation alert card */}
        <Card className="border-purple-500/30 bg-purple-950/20 p-6 sm:p-8 space-y-5 rounded-2xl shadow-xl shadow-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-purple-200">
              The Golden Rule: 0 is the Highest Digit
            </h3>
          </div>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            In Genie Markets smart contracts (<code className="font-mono text-purple-300 font-semibold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">GenieMath.sol</code>),
            digits are ranked strictly in Genie order:
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 py-3 font-mono text-base sm:text-lg tabular-nums">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <div key={num} className="flex items-center gap-2 sm:gap-2.5">
                <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-base sm:text-lg font-bold shadow-inner">
                  {num}
                </span>
                <span className="text-zinc-600 font-mono text-sm font-bold">&lt;</span>
              </div>
            ))}
            <div className="flex items-center">
              <span className="flex h-11 sm:h-12 px-4 items-center justify-center rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-200 font-mono text-base sm:text-lg font-extrabold shadow-md shadow-purple-600/20">
                0 <span className="text-xs text-purple-300/80 ml-2 font-semibold tracking-wide">(Rank 10)</span>
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-purple-500/20 pt-4">
            Because 0 has the highest rank (10), any pick containing 0 must place 0 at the end (e.g. <strong className="text-white font-mono">1-5-0</strong> or <strong className="text-white font-mono">3-9-0</strong>).
            A combination like <em className="text-zinc-400 font-mono">0-1-5</em> is invalid and must be submitted as <strong className="text-purple-300 font-mono">1-5-0</strong>.
          </p>
        </Card>

        {/* Interactive Genie-Sort Simulator Widget */}
        <Card className="bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 p-7 sm:p-9 space-y-7 rounded-2xl shadow-xl shadow-black/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shrink-0 shadow-sm">
                <Shuffle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-white font-heading">
                  Interactive Genie-Sort & Derivation Tester
                </CardTitle>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Choose or roll 3 random digits to see live Genie-sorting, trio categorization, and single digit derivation.
                </p>
              </div>
            </div>
            <Button
              onClick={rollRandom}
              className="h-11 px-5 rounded-xl gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md shadow-violet-600/20 cursor-pointer transition-all shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              Roll Random Draw
            </Button>
          </div>

          {/* 3 Input Selectors */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { val: digit1, setter: setDigit1, label: "Digit 1" },
              { val: digit2, setter: setDigit2, label: "Digit 2" },
              { val: digit3, setter: setDigit3, label: "Digit 3" },
            ].map((d, i) => (
              <div key={i} className="text-center space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">{d.label}</label>
                <select
                  value={d.val}
                  onChange={(e) => d.setter(parseInt(e.target.value))}
                  className="w-full h-14 rounded-2xl border border-zinc-800/90 bg-zinc-950/90 py-3 text-center font-mono text-2xl font-extrabold text-white focus:border-violet-500 focus:outline-none shadow-inner cursor-pointer"
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
          <div className="grid gap-4 sm:grid-cols-3 pt-3 border-t border-zinc-800/80">
            {/* Box 1: Raw vs Sorted */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-5 space-y-3 text-center shadow-inner flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Genie-Sorted Trio</span>
              <div className="flex items-center justify-center gap-2.5 font-mono text-2xl sm:text-3xl font-extrabold text-white tabular-nums py-1">
                <span className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 border border-violet-500/35 shadow-md shadow-violet-500/10">
                  {sortedD1}
                </span>
                <span className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 border border-violet-500/35 shadow-md shadow-violet-500/10">
                  {sortedD2}
                </span>
                <span className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 border border-violet-500/35 shadow-md shadow-violet-500/10">
                  {sortedD3}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Canonical: <strong className="text-white font-mono font-bold tabular-nums">{sortedD1}{sortedD2}{sortedD3}</strong>{" "}
                <span className={isRawSorted ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  ({isRawSorted ? "Already Genie-sorted" : "Reordered into Genie rank"})
                </span>
              </p>
            </div>

            {/* Box 2: Trio Classification */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-5 space-y-3 text-center shadow-inner flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Trio Category & Payout</span>
              <div className="py-2">
                <Badge
                  variant="outline"
                  className={`font-mono font-bold text-sm px-3.5 py-1.5 rounded-xl tabular-nums ${trioInfo.badgeClass}`}
                >
                  {trioInfo.type} Trio ({trioInfo.payout}x)
                </Badge>
              </div>
              <p className="text-xs text-zinc-300/90">{trioInfo.desc}</p>
            </div>

            {/* Box 3: Derived Single */}
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-5 space-y-3 text-center shadow-inner flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Derived Single Digit</span>
              <div className="flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold text-violet-400 tabular-nums py-1">
                <span className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 text-violet-300 shadow-inner">
                  {derivedSingle}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono tabular-nums">
                ({sortedD1} + {sortedD2} + {sortedD3}) % 10 = <span className="font-bold text-violet-300">{derivedSingle}</span>
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: INTERACTIVE PAYOUT & PROFIT CALCULATOR
      ───────────────────────────────────────────────────────────── */}
      <section id="calculator" className="space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/10 shrink-0">
            <Calculator className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Payout & Return Calculator
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Calculate your potential winnings and net return for any bet type and wager amount.
            </p>
          </div>
        </div>

        <Card className="bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 p-7 sm:p-9 space-y-8 rounded-2xl shadow-xl shadow-black/30">
          {/* Bet Type Picker */}
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Select Bet Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "Single" as const, label: "Single", sub: "9x" },
                { id: "Pair" as const, label: "Pair", sub: "90x" },
                { id: "UniqueTrio" as const, label: "Unique Trio", sub: "140x" },
                { id: "TwinTrio" as const, label: "Twin Trio", sub: "280x" },
                { id: "JackpotTrio" as const, label: "Jackpot Trio", sub: "600x" },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={calcBetType === item.id ? "default" : "outline"}
                  onClick={() => setCalcBetType(item.id)}
                  className={`h-auto flex-col py-4 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
                    calcBetType === item.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border-violet-500 scale-[1.02]"
                      : "border-zinc-800/90 bg-zinc-950/60 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="text-sm font-bold font-heading">{item.label}</span>
                  <span className={`text-xs font-mono font-bold tabular-nums mt-1 px-2.5 py-0.5 rounded-md ${
                    calcBetType === item.id ? "bg-white/20 text-white" : "bg-zinc-800/90 text-zinc-300"
                  }`}>
                    {item.sub}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Wager Input & Quick Chips */}
          <div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Wager Amount (USDC)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="0.1"
                  step="1"
                  value={calcWager}
                  onChange={(e) => setCalcWager(e.target.value)}
                  placeholder="10"
                  className="font-mono text-lg font-bold tabular-nums bg-[#07090E] border-white/10 rounded-xl pl-9 pr-4 py-3 h-13 text-white focus:border-violet-500 shadow-inner"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-zinc-500">
                  $
                </span>
              </div>

              <div className="flex gap-2">
                {["1", "5", "10", "25", "50", "100"].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setCalcWager(amt)}
                    className={`flex-1 font-mono text-xs sm:text-sm font-bold tabular-nums h-13 px-3.5 rounded-xl border-zinc-800/90 cursor-pointer transition-all ${
                      calcWager === amt
                        ? "bg-violet-600/25 text-violet-200 border-violet-500/60 shadow-md shadow-violet-500/10"
                        : "bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Payout Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3 pt-3 border-t border-zinc-800/80">
            <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-6 space-y-2 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Payout Multiplier</p>
              <p className="mt-1 font-mono text-3xl sm:text-4xl font-extrabold text-violet-400 tabular-nums">
                {calcMultiplier}x
              </p>
              <p className="text-xs text-zinc-500 mt-1">Contract multiplier</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-2 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Total Projected Payout</p>
              <p className="mt-1 font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums">
                ${grossPayout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-emerald-400/80 mt-1 font-mono">USDC directly credited</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-2 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Net Profit</p>
              <p className="mt-1 font-mono text-3xl sm:text-4xl font-extrabold text-amber-400 tabular-nums">
                +${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-amber-400/80 mt-1 font-mono tabular-nums">
                {wagerNum > 0 ? (
                  <span className="font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                    +{((netProfit / wagerNum) * 100).toFixed(0)}% ROI
                  </span>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: ROUND LIFECYCLE & TIMELINE
      ───────────────────────────────────────────────────────────── */}
      <section id="timeline" className="max-w-4xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 shadow-lg shadow-blue-500/10">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
            The 24-Hour Round Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
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
              icon: Coins,
              iconColor: "text-emerald-400",
              iconBoxClass: "bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/10",
              hoverBorder: "hover:border-emerald-500/40",
              badgeVariant: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
            },
            {
              time: "21:00 Checkpoint",
              title: "Open Cutoff & VRF Draw",
              desc: "Open betting closes. Anyone can trigger the permissionless Open Draw transaction. Chainlink VRF returns a tamper-proof random number that reveals openD1, openD2, openD3, and derives the Open Single digit.",
              status: "Drawing",
              icon: Shuffle,
              iconColor: "text-amber-400",
              iconBoxClass: "bg-amber-500/15 border-amber-500/30 shadow-amber-500/10",
              hoverBorder: "hover:border-amber-500/40",
              badgeVariant: "border-amber-500/40 bg-amber-500/15 text-amber-300",
            },
            {
              time: "21:00 – 24:00",
              title: "Close Betting Phase",
              desc: "Open digits are now known to everyone! Betting continues for Close Single and Close Trio until the 24-hour mark.",
              status: "Close Bets Open",
              icon: Zap,
              iconColor: "text-blue-400",
              iconBoxClass: "bg-blue-500/15 border-blue-500/30 shadow-blue-500/10",
              hoverBorder: "hover:border-blue-500/40",
              badgeVariant: "border-blue-500/40 bg-blue-500/15 text-blue-300",
            },
            {
              time: "24:00 Checkpoint",
              title: "Close Cutoff & Settle Round",
              desc: "Close betting ends. The Close Draw is triggered via Chainlink VRF, revealing closeD1, closeD2, closeD3, deriving Close Single, and calculating the final 2-digit Pair result (openSingle × 10 + closeSingle).",
              status: "Settling",
              icon: RefreshCw,
              iconColor: "text-purple-400",
              iconBoxClass: "bg-purple-500/15 border-purple-500/30 shadow-purple-500/10",
              hoverBorder: "hover:border-purple-500/40",
              badgeVariant: "border-purple-500/40 bg-purple-500/15 text-purple-300",
            },
            {
              time: "Next 30 Days",
              title: "Settled & Claims Window",
              desc: "The round is Settled! Winners can claim their payouts anytime over the next 30 days directly from the Play page or History page. Meanwhile, the next round immediately initializes.",
              status: "Claims Open",
              icon: Trophy,
              iconColor: "text-amber-300",
              iconBoxClass: "bg-amber-500/15 border-amber-500/30 shadow-amber-500/10",
              hoverBorder: "hover:border-amber-500/40",
              badgeVariant: "border-amber-500/40 bg-amber-500/15 text-amber-300",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className={`group relative bg-[#0B0F1A]/85 backdrop-blur-xl border-white/10 ${item.hoverBorder} hover:bg-zinc-900/85 transition-all duration-300 p-6 sm:p-7 rounded-2xl shadow-xl shadow-black/30`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                  {/* Left Icon (With Mobile Top Bar) */}
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <div
                      className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border ${item.iconBoxClass} shadow-md transition-all duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.iconColor}`} />
                    </div>

                    {/* Mobile Badges (Shown only on small screens) */}
                    <div className="flex sm:hidden items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-zinc-200 bg-zinc-800/90 border border-zinc-700/80 px-2 py-0.5 rounded-md tabular-nums">
                        {item.time}
                      </span>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[11px] font-semibold px-2 py-0.5 flex items-center gap-1.5 ${item.badgeVariant}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                        {item.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Center Content: Title and Description */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading group-hover:text-zinc-100 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-300/90 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Desktop Right Column: Time Pill + Status Badge with Divider */}
                  <div className="hidden sm:flex flex-col items-end shrink-0 gap-2.5 pl-6 border-l border-zinc-800/90 min-w-[180px]">
                    <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-800/95 border border-zinc-700/80 px-3 py-1.5 rounded-lg tabular-nums shadow-inner">
                      {item.time}
                    </span>
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs font-semibold px-3 py-1 flex items-center gap-1.5 ${item.badgeVariant}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="space-y-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-md shadow-violet-500/10 shrink-0">
            <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              Everything you need to know about odds, claims, security, and protocol rules.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="bg-zinc-900/50 border-zinc-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-white hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base pr-4 text-zinc-100">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-violet-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/80">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Ready to Make Your Prediction?
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          Sign in now, place your bet on the active round, and see if your intuition can land the 600x Jackpot.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/play">
            <Button
              size="lg"
              className="gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-xl shadow-violet-600/30"
            >
              Go to Game
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/history">
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
            >
              View Past Rounds
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
