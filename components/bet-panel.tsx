"use client";

import { useState } from "react";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { usePlaceBet } from "@/hooks/use-place-bet";
import {
  BetType,
  BET_TYPE_LABELS,
  PAYOUTS,
  getTrioPayoutMultiplier,
  isValidTrio,
  formatUsdcDollar,
  parseUsdc,
} from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  PlusCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";

const QUICK_AMOUNTS = ["1", "5", "10", "25"];

export function BetPanel({ onBetPlaced }: { onBetPlaced?: () => void } = {}) {
  const { login, authenticated, ready } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { fundWallet } = useFundWallet();
  const {
    roundId,
    round,
    openTimeRemaining,
    closeTimeRemaining,
    isOpenBettingActive,
    isCloseBettingActive,
  } = useCurrentRound();
  const { placeBet, step, error, reset, balance, isEmbedded } = usePlaceBet(onBetPlaced);

  const [marketSide, setMarketSide] = useState<"open" | "close">("open");
  const [selectedBetType, setSelectedBetType] = useState<BetType>(
    BetType.OpenSingle
  );
  const [pick, setPick] = useState<string>("");
  const [wager, setWager] = useState<string>("");

  const hasBalance = balance && balance > 0n;

  const activeBetType = selectedBetType;
  const isOpenBet =
    activeBetType === BetType.OpenSingle ||
    activeBetType === BetType.OpenTrio ||
    activeBetType === BetType.Pair;

  const isMarketOpenForBet = isOpenBet
    ? isOpenBettingActive
    : isCloseBettingActive;

  // Pick validation
  const getPickMax = () => {
    if (
      activeBetType === BetType.OpenSingle ||
      activeBetType === BetType.CloseSingle
    )
      return 9;
    if (activeBetType === BetType.Pair) return 99;
    return 999;
  };

  const pickNum = parseInt(pick) || 0;
  const isTrioBet =
    activeBetType === BetType.OpenTrio || activeBetType === BetType.CloseTrio;
  const isPickValid =
    pick !== "" &&
    pickNum >= 0 &&
    pickNum <= getPickMax() &&
    (!isTrioBet || isValidTrio(pickNum));
  const isWagerValid = wager !== "" && parseFloat(wager) > 0;

  // Calculate potential payout
  const getMultiplier = () => {
    if (
      activeBetType === BetType.OpenSingle ||
      activeBetType === BetType.CloseSingle
    )
      return PAYOUTS[BetType.OpenSingle];
    if (activeBetType === BetType.Pair) return PAYOUTS[BetType.Pair];
    if (isTrioBet && isPickValid) return getTrioPayoutMultiplier(pickNum);
    return PAYOUTS.uniqueTrio;
  };

  const multiplier = getMultiplier();
  const potentialPayout =
    isWagerValid && isPickValid
      ? formatUsdcDollar(parseUsdc((parseFloat(wager) * multiplier).toString()))
      : "$0.00";

  const handlePlaceBet = async () => {
    if (!roundId || !isPickValid || !isWagerValid || !isMarketOpenForBet) return;
    await placeBet(roundId, activeBetType, pickNum, wager);
  };

  const handleAddFunds = async () => {
    if (!walletAddress) return;
    try {
      await fundWallet({ address: walletAddress });
    } catch (err) {
      console.warn("Funding flow closed or error:", err);
    }
  };

  if (!round) {
    return (
      <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-4">
        <Skeleton className="h-6 w-36 bg-zinc-800/50" />
        <Skeleton className="h-10 w-full bg-zinc-800/50" />
        <Skeleton className="h-20 w-full bg-zinc-800/50" />
        <Skeleton className="h-11 w-full bg-zinc-800/50" />
      </Card>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <Card className="border-emerald-500/30 bg-[#0B0F1A]/90 p-8 text-center space-y-5 rounded-2xl shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-hud font-bold text-white uppercase tracking-wide">
            Prediction Confirmed Onchain
          </CardTitle>
          <p className="text-sm font-mono text-slate-400">
            Smart contract escrow committed. Verified on Ethereum Sepolia.
          </p>
        </div>
        <Button
          variant="cyber"
          onClick={() => {
            reset();
            setPick("");
            setWager("");
          }}
          className="font-hud font-bold tracking-wider uppercase px-6 h-11"
        >
          Execute Another Prediction
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-6 sm:p-7 space-y-6 shadow-2xl shadow-black/80">
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-hud font-bold text-white uppercase tracking-wide">
              Prediction Terminal
            </CardTitle>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Autonomous Non-Custodial Pool
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-xs px-3 py-1 bg-[#07090E] text-slate-300 font-semibold border-white/10"
        >
          Round #{roundId ? roundId.toString() : "—"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* Market Selector Tabs */}
        <div className="space-y-2">
          <span className="font-hud text-xs font-bold uppercase tracking-wider text-slate-400">
            Market Window
          </span>
          <Tabs
            value={marketSide}
            onValueChange={(val) => {
              const side = val as "open" | "close";
              setMarketSide(side);
              if (side === "open") {
                if (
                  selectedBetType !== BetType.OpenSingle &&
                  selectedBetType !== BetType.OpenTrio &&
                  selectedBetType !== BetType.Pair
                ) {
                  setSelectedBetType(BetType.OpenSingle);
                  setPick("");
                }
              } else {
                if (
                  selectedBetType !== BetType.CloseSingle &&
                  selectedBetType !== BetType.CloseTrio
                ) {
                  setSelectedBetType(BetType.CloseSingle);
                  setPick("");
                }
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-14 bg-[#07090E] p-1.5 rounded-2xl border border-white/10">
              <TabsTrigger
                value="open"
                className="flex items-center justify-center gap-2 h-11 font-hud font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl"
              >
                <span>Open Market</span>
                <Badge
                  variant={isOpenBettingActive ? (marketSide === "open" ? "default" : "emerald") : "secondary"}
                  className="font-mono text-[10px] px-2 py-0.5"
                >
                  {isOpenBettingActive ? formatCountdown(openTimeRemaining) : "Locked"}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="close"
                className="flex items-center justify-center gap-2 h-11 font-hud font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl"
              >
                <span>Close Market</span>
                <Badge
                  variant={isCloseBettingActive ? (marketSide === "close" ? "default" : "cyber") : "secondary"}
                  className="font-mono text-[10px] px-2 py-0.5"
                >
                  {isCloseBettingActive ? formatCountdown(closeTimeRemaining) : "Locked"}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bet Types Buttons */}
        <div className="space-y-2">
          <span className="font-hud text-xs font-bold uppercase tracking-wider text-slate-400">
            Prediction Derivative Type
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(marketSide === "open"
              ? [BetType.OpenSingle, BetType.Pair, BetType.OpenTrio]
              : [BetType.CloseSingle, BetType.CloseTrio]
            ).map((bt) => {
              const isSelected = activeBetType === bt;
              const isJackpot = bt === BetType.OpenTrio || bt === BetType.CloseTrio;
              const isPair = bt === BetType.Pair;
              return (
                <button
                  key={bt}
                  type="button"
                  onClick={() => {
                    setSelectedBetType(bt);
                    setPick("");
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                      ? isJackpot
                        ? "bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/20 text-white ring-1 ring-amber-400/40"
                        : isPair
                          ? "bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/20 text-white ring-1 ring-cyan-400/40"
                          : "bg-violet-600/25 border-violet-500/60 shadow-lg shadow-violet-600/20 text-white ring-1 ring-violet-400/40"
                      : "border-white/10 bg-[#07090E]/80 text-slate-400 hover:border-white/25 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span className="font-hud text-xs sm:text-sm font-bold uppercase tracking-wider">
                    {bt === BetType.OpenSingle || bt === BetType.CloseSingle
                      ? "Single"
                      : bt === BetType.Pair
                        ? "Pair"
                        : "Trio"}
                  </span>
                  <span
                    className={`font-mono text-xs font-extrabold mt-0.5 ${isSelected
                        ? isJackpot
                          ? "text-amber-300"
                          : isPair
                            ? "text-cyan-300"
                            : "text-violet-300"
                        : "text-slate-500"
                      }`}
                  >
                    {bt === BetType.OpenSingle || bt === BetType.CloseSingle
                      ? "9x Payout"
                      : bt === BetType.Pair
                        ? "90x Payout"
                        : "Up to 600x"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pick Input Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-hud font-bold uppercase tracking-wider text-slate-300">
              Select Your Numeric Pick
            </span>
            <span className="font-mono text-slate-400">
              {activeBetType === BetType.OpenSingle ||
                activeBetType === BetType.CloseSingle
                ? "Digit 0–9"
                : activeBetType === BetType.Pair
                  ? "Digits 00–99"
                  : "000–999 (Genie-sorted)"}
            </span>
          </div>

          {/* Single: Hardware Security Digit Keypad (0-9) */}
          {(activeBetType === BetType.OpenSingle ||
            activeBetType === BetType.CloseSingle) && (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, i) => {
                  const isPicked = pick === i.toString();
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPick(i.toString())}
                      className={`h-14 rounded-xl font-hud text-2xl font-extrabold tabular-nums cursor-pointer transition-all duration-200 border relative overflow-hidden ${isPicked
                          ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white border-violet-400 shadow-lg shadow-violet-600/40 ring-2 ring-violet-400/50 scale-[1.04] text-glow-violet"
                          : "border-white/10 bg-[#07090E] text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white"
                        }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            )}

          {/* Pair / Trio: Terminal Numeric Input */}
          {(activeBetType === BetType.Pair || isTrioBet) && (
            <div className="space-y-2">
              <Input
                type="number"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                placeholder={activeBetType === BetType.Pair ? "Enter 00–99 (e.g. 42)" : "Enter 3 digits in Genie order (e.g. 123)"}
                min={0}
                max={getPickMax()}
                className="h-14 rounded-2xl bg-[#07090E] border-white/10 font-hud text-xl font-bold tabular-nums text-white focus:border-violet-500 shadow-inner px-4"
              />
              {isTrioBet && pick !== "" && !isPickValid && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Trio must adhere to Genie-sort rule: 1 &lt; 2 &lt; ... &lt; 9 &lt; 0 (Rank 0 is highest)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wager Input Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-hud font-bold uppercase tracking-wider text-slate-300">
              Wager Stake (USDC)
            </span>
            {balance !== undefined && (
              <span className="font-mono text-slate-400 font-semibold tabular-nums">
                Vault: <span className="text-emerald-400 font-bold">{formatUsdcDollar(balance)}</span>
              </span>
            )}
          </div>

          {/* Input with Token Badge & Max Button */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none">
              <Badge
                variant="outline"
                className="font-mono text-xs border-white/15 bg-white/5 text-slate-200 px-2.5 py-1 font-bold"
              >
                USDC
              </Badge>
            </div>
            <Input
              type="number"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              placeholder="0.00"
              min={0}
              step="0.01"
              className="h-14 rounded-2xl bg-[#07090E] border-white/10 pl-24 pr-20 font-hud text-xl font-bold text-white focus:border-violet-500 shadow-inner"
            />
            <div className="absolute right-2.5 flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (balance) {
                    const maxUsdc = (Number(balance) / 1_000_000).toFixed(2);
                    setWager(maxUsdc);
                  }
                }}
                className="h-9 px-3 rounded-xl font-mono text-xs font-extrabold text-violet-300 bg-violet-500/15 hover:bg-violet-500/30 hover:text-white"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Quick Amounts Chips */}
          <div className="flex gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWager(amt)}
                className={`flex-1 font-mono text-xs sm:text-sm font-bold tabular-nums h-9 rounded-xl ${wager === amt
                    ? "bg-violet-600/30 text-violet-200 border-violet-500 shadow-md shadow-violet-600/20"
                    : "bg-[#07090E] border-white/10 text-slate-400 hover:text-white"
                  }`}
              >
                ${amt}
              </Button>
            ))}
          </div>

          {/* High-Tech Profit & Payout Terminal Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-[#07090E] p-4 shadow-inner">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Multiplier Ratio
                </span>
                <p className="font-hud text-base sm:text-lg font-extrabold text-violet-300">
                  {multiplier}x
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Estimated Net Profit
                </span>
                <p className="font-mono text-base sm:text-lg font-bold text-emerald-400 tabular-nums">
                  {isWagerValid && isPickValid
                    ? formatUsdcDollar(parseUsdc((parseFloat(wager) * (multiplier - 1)).toString()))
                    : "$0.00"}
                </p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0">
                <span className="font-hud text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Projected Payout
                </span>
                <p className="font-hud text-xl sm:text-2xl font-extrabold text-amber-300 tabular-nums text-glow-gold">
                  {potentialPayout}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gasless / Network State Indicator */}
        {authenticated && isEmbedded && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300 shadow-sm font-mono">
            <span className="flex items-center gap-2 font-semibold">
              <Zap className="h-4 w-4 text-emerald-400" />
              ERC-4337 Account Abstraction Active
            </span>
            <span className="text-emerald-400 font-bold">100% Gas Sponsored</span>
          </div>
        )}

        {authenticated && !isEmbedded && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>External EOA connected: Sepolia testnet ETH needed for gas</span>
          </div>
        )}

        {/* Main Execution Button */}
        {!ready ? (
          <Button disabled className="w-full h-14 rounded-2xl bg-[#07090E] text-slate-600 font-hud">
            Connecting Vault Engine…
          </Button>
        ) : !authenticated ? (
          <Button
            onClick={login}
            variant="default"
            className="w-full h-14 rounded-2xl gap-2 font-hud font-bold text-base uppercase tracking-wider shadow-2xl"
          >
            <Wallet className="h-4 w-4" />
            Connect Web3 Wallet to Play
          </Button>
        ) : !hasBalance ? (
          <Button
            onClick={handleAddFunds}
            variant="cyber"
            className="w-full h-14 rounded-2xl gap-2 animate-pulse font-hud font-bold text-base uppercase tracking-wider shadow-2xl"
          >
            <PlusCircle className="h-4 w-4" />
            Deposit USDC to Place Bet
          </Button>
        ) : step === "approving" ? (
          <Button
            disabled
            className="w-full h-14 rounded-2xl gap-2 bg-violet-600/60 font-hud font-bold text-white uppercase tracking-wider"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Approving USDC in Smart Account…
          </Button>
        ) : step === "betting" ? (
          <Button
            disabled
            className="w-full h-14 rounded-2xl gap-2 bg-violet-600/60 font-hud font-bold text-white uppercase tracking-wider"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Committing Wager to Smart Contract…
          </Button>
        ) : !isMarketOpenForBet ? (
          <Button
            disabled
            className="w-full h-14 rounded-2xl bg-[#07090E] border border-white/10 text-slate-500 font-hud font-bold uppercase tracking-wider"
          >
            {isOpenBet ? "Open Market Lock Elapsed" : "Close Market Lock Elapsed"}
          </Button>
        ) : (
          <Button
            onClick={handlePlaceBet}
            disabled={!isPickValid || !isWagerValid}
            variant="default"
            className="w-full h-14 rounded-2xl gap-2 font-hud font-bold text-base uppercase tracking-wider shadow-2xl shadow-violet-600/30 transition-all active:scale-[0.99]"
          >
            <ShieldCheck className="h-5 w-5" />
            Commit Prediction ({BET_TYPE_LABELS[activeBetType]})
          </Button>
        )}

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
