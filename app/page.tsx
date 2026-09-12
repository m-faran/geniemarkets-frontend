"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dice5,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Trophy,
  Cpu,
  Lock,
  Activity,
} from "lucide-react";

const PROTOCOL_METRICS = [
  { label: "Max Odds Multiplier", value: "600x", detail: "Genie-Sorted Trio Jackpot", color: "text-amber-400" },
  { label: "Randomness Engine", value: "Chainlink VRF", detail: "v2.5 Direct Verifiable", color: "text-cyan-400" },
  { label: "Execution Layer", value: "Ethereum Sepolia", detail: "Chain ID 11155111", color: "text-violet-400" },
  { label: "Gas Sponsorship", value: "Zero Gas (AA)", detail: "ERC-4337 Sponsored", color: "text-emerald-400" },
];

const PREDICTION_MODES = [
  {
    name: "Single Digit",
    badge: "Fast Pace",
    desc: "Predict one specific digit (0-9) drawn from the onchain entropy pool. High frequency, low barrier.",
    payout: "9.0x",
    odds: "1 in 10",
    icon: Dice5,
    tag: "SINGLE",
    accent: "border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/10",
    payoutColor: "text-cyan-300",
    badgeVariant: "cyber" as const,
  },
  {
    name: "Exact Pair",
    badge: "Strategic Alpha",
    desc: "Predict two sequenced digits (00-99). Optimal risk-adjusted payout for high-probability systematic predictions.",
    payout: "90.0x",
    odds: "1 in 100",
    icon: Sparkles,
    tag: "PAIR",
    accent: "border-violet-500/30 hover:border-violet-500/60 shadow-violet-500/10",
    payoutColor: "text-violet-300",
    badgeVariant: "default" as const,
  },
  {
    name: "Genie Trio",
    badge: "Jackpot Tier",
    desc: "Predict three digits (000-999) with automated Genie permutation sorting for maximum payout tiers.",
    payout: "140x - 600x",
    odds: "Up to 600x",
    icon: Trophy,
    tag: "TRIO",
    accent: "border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/10",
    payoutColor: "text-amber-300",
    badgeVariant: "gold" as const,
  },
];

const ARCHITECTURE_STEPS = [
  {
    step: "01",
    title: "Commit Position",
    desc: "Select Single, Pair, or Trio predictions. Wager in native USDC directly via smart contract escrow with zero gas fees.",
    icon: Lock,
  },
  {
    step: "02",
    title: "Chainlink VRF v2.5",
    desc: "Upon round close, the smart contract queries Chainlink's verifiable random function. Unpredictable, tamper-proof entropy.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Onchain Settlement",
    desc: "Winning positions unlock instantaneous pull-based payouts in USDC. Verified trustless execution with no intermediary.",
    icon: Zap,
  },
];

const SECURITY_PILLARS = [
  {
    icon: Shield,
    title: "Zero-Gas Smart Accounts",
    desc: "Sign in with Google, email, or Web3 wallet. Privy embedded account abstraction sponsors all onchain execution gas.",
    tag: "ERC-4337",
  },
  {
    icon: Cpu,
    title: "Verifiable Randomness",
    desc: "Every digit outcome is verified cryptographically by Chainlink VRF v2.5 oracles before onchain state changes.",
    tag: "Chainlink",
  },
  {
    icon: Lock,
    title: "Non-Custodial Escrow",
    desc: "Funds remain locked in decentralized smart contracts. 24-hour permissionless stale round recovery guarantees full player safety.",
    tag: "Failsafe",
  },
];

export default function LandingPage() {
  const { authenticated } = usePrivy();

  return (
    <div className="relative overflow-hidden space-y-24 pb-24">
      {/* Dynamic atmospheric lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute top-2/3 -right-32 h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-[130px]" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24 text-center">
        {/* Network & Live Telemetry Pill */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#0B0F1A]/90 border border-white/10 px-4 py-1.5 shadow-2xl backdrop-blur-xl mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-hud uppercase tracking-widest text-xs text-slate-300">
            Sepolia Testnet (11155111)
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-hud uppercase tracking-wider text-[11px] text-cyan-400">
            Chainlink VRF v2.5
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-hud uppercase tracking-wider text-[11px] text-emerald-400">
            Zero-Gas AA
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="font-heading font-black tracking-tight text-4xl sm:text-6xl lg:text-7xl text-white max-w-4xl mx-auto leading-[1.08]">
          The Decentralized
          <br />
          <span className="bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#F59E0B] bg-clip-text text-transparent">
            Prediction Protocol
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
          Predict onchain digits resolved by Chainlink VRF v2.5. Commit USDC, 
          verify cryptographic proofs on Ethereum, and claim up to <span className="text-amber-400 font-bold font-hud">600x</span> instant payouts.
        </p>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/play">
            <Button
              variant="cyber"
              size="lg"
              className="h-13 px-8 text-sm font-hud uppercase tracking-wider gap-2.5 shadow-2xl shadow-cyan-500/20"
            >
              {authenticated ? "Enter Prediction Arena" : "Launch Trading Console"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 text-sm font-hud uppercase tracking-wider text-slate-300 hover:text-white border-white/10 hover:border-white/20"
            >
              Protocol Architecture
            </Button>
          </Link>
        </div>

        {/* Interactive Terminal Demo Preview Card */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-white/10 bg-[#0B0F1A]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Top highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-slate-400 ml-2">genie.engine.v2 // live-draw-telemetry</span>
              </div>
              <Badge variant="cyber" className="text-[10px] font-hud uppercase">
                Round #42 Active
              </Badge>
            </div>

            {/* Nixie Tumbler Simulation Preview */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <span className="font-hud uppercase tracking-widest text-[11px] text-slate-400">
                Cryptographic Entropy Tumbler (VRF Verified)
              </span>

              <div className="flex items-center gap-3 sm:gap-4">
                {[
                  { digit: "7", label: "DIGIT 1" },
                  { digit: "3", label: "DIGIT 2" },
                  { digit: "9", label: "DIGIT 3" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="relative h-20 w-16 sm:h-24 sm:w-20 rounded-xl bg-[#05070B] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 overflow-hidden group">
                      {/* Scanline texture */}
                      <div className="scanlines absolute inset-0 pointer-events-none opacity-40" />
                      {/* Filament glow */}
                      <div className="absolute inset-x-2 top-1.5 h-[1px] bg-cyan-400/40 shadow-[0_0_8px_#00f2fe]" />
                      <span className="font-hud font-black text-3xl sm:text-4xl text-cyan-300 text-glow-cyan">
                        {item.digit}
                      </span>
                    </div>
                    <span className="font-hud text-[9px] uppercase tracking-wider text-slate-500">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Instant Odds Banner */}
              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-400 pt-2">
                <span>Single: <strong className="text-cyan-400">9x</strong></span>
                <span>•</span>
                <span>Pair: <strong className="text-violet-400">90x</strong></span>
                <span>•</span>
                <span>Trio: <strong className="text-amber-400">600x</strong></span>
              </div>
            </div>

            {/* Bottom Telemetry Strip */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-hud uppercase tracking-wider text-[11px]">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Network Latency: <span className="text-white font-mono">0.4s (Sepolia)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-hud uppercase tracking-wider text-[11px]">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                Tamper-Proof VRF v2.5 Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Metrics Strip */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PROTOCOL_METRICS.map((metric, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl p-5 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="font-hud uppercase tracking-wider text-[11px] text-slate-400">
                {metric.label}
              </p>
              <p className={`font-hud font-black text-2xl sm:text-3xl mt-1 ${metric.color}`}>
                {metric.value}
              </p>
              <p className="font-mono text-[11px] text-slate-500 mt-1">
                {metric.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Prediction Modes Grid */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs font-hud uppercase tracking-widest text-slate-300 border-white/10 bg-[#0B0F1A]">
            Dynamic Market Profiles
          </Badge>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Three Structured Ways to Win
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Choose your risk profile from high-frequency single-digit predictions to 600x jackpot trios.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PREDICTION_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.name}
                className={`rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:-translate-y-1 ${mode.accent} flex flex-col justify-between relative overflow-hidden`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07090E] border border-white/10">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={mode.badgeVariant} className="text-[10px] font-hud uppercase tracking-wider">
                      {mode.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-heading font-black text-2xl text-white">
                      {mode.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <span className="font-hud uppercase tracking-wider text-[10px] text-slate-500 block">
                      Target Odds
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {mode.odds}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-hud uppercase tracking-wider text-[10px] text-slate-500 block">
                      Max Multiplier
                    </span>
                    <span className={`font-hud font-black text-3xl ${mode.payoutColor}`}>
                      {mode.payout}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Protocol Architecture Workflow */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl space-y-10 relative overflow-hidden">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="cyber" className="text-[10px] font-hud uppercase tracking-widest">
              Smart Contract Lifecycle
            </Badge>
            <h2 className="font-heading font-black text-3xl text-white tracking-tight">
              Trustless Onchain Execution Pipeline
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every round executes transparently through verifiable Ethereum smart contracts. Zero operator intervention.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ARCHITECTURE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="rounded-2xl border border-white/5 bg-[#07090E]/90 p-6 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-hud font-black text-2xl text-cyan-400">
                      {step.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h4 className="font-heading font-bold text-lg text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Security Highlights */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs font-hud uppercase tracking-widest text-slate-300 border-white/10 bg-[#0B0F1A]">
            Decentralized Standards
          </Badge>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Institutional-Grade Web3 Infrastructure
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {SECURITY_PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl p-6 sm:p-7 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#07090E] border border-white/10 text-cyan-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-slate-300 border-white/10 bg-[#05070B]">
                    {p.tag}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-white">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-[#0B0F1A]/90 to-[#07090E] p-8 sm:p-12 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Ready to Predict with Onchain Certainty?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Connect your wallet or sign in with email in 5 seconds. Gas fees are 100% sponsored.
          </p>
          <div className="flex justify-center pt-2">
            <Link href="/play">
              <Button
                variant="gold"
                size="lg"
                className="h-12 px-8 font-hud uppercase tracking-wider text-xs gap-2"
              >
                Enter Arena Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
