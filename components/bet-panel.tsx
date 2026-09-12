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
      <Card className="border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <div>
          <CardTitle className="text-xl font-bold text-white">Bet Placed Successfully!</CardTitle>
          <p className="mt-1 text-sm text-zinc-400">
            Your prediction has been recorded onchain.
          </p>
        </div>
        <Button
          onClick={() => {
            reset();
            setPick("");
            setWager("");
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md shadow-violet-600/25"
        >
          Place Another Bet
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-6 sm:p-7 space-y-6 shadow-xl shadow-black/30">
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-extrabold text-white font-heading tracking-tight">
            Place Your Prediction
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-xs px-3 py-1 border-zinc-800/90 bg-zinc-950/80 text-zinc-300 font-semibold"
        >
          Round #{roundId ? roundId.toString() : "—"}
        </Badge>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {/* Market Selector Tabs */}
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
          <TabsList className="grid w-full grid-cols-2 items-center bg-zinc-950/90 border border-zinc-800/90 p-1.5 group-data-horizontal/tabs:h-14 !h-14 rounded-2xl shadow-inner">
            <TabsTrigger
              value="open"
              className="flex items-center justify-center gap-2.5 h-11 w-full my-auto rounded-xl text-xs sm:text-sm font-heading font-bold data-active:bg-gradient-to-r data-active:from-violet-600 data-active:to-purple-600 data-active:text-white data-active:shadow-lg data-active:shadow-violet-600/30 transition-all cursor-pointer"
            >
              <span className="leading-none flex items-center">Open Market</span>
              <Badge
                variant="secondary"
                className={`font-mono text-xs tabular-nums px-2.5 py-0.5 rounded-lg flex items-center leading-none ${
                  isOpenBettingActive
                    ? marketSide === "open"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "bg-zinc-900 text-zinc-500"
                }`}
              >
                {isOpenBettingActive
                  ? formatCountdown(openTimeRemaining)
                  : "Closed"}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="close"
              className="flex items-center justify-center gap-2.5 h-11 w-full my-auto rounded-xl text-xs sm:text-sm font-heading font-bold data-active:bg-gradient-to-r data-active:from-violet-600 data-active:to-purple-600 data-active:text-white data-active:shadow-lg data-active:shadow-violet-600/30 transition-all cursor-pointer"
            >
              <span className="leading-none flex items-center">Close Market</span>
              <Badge
                variant="secondary"
                className={`font-mono text-xs tabular-nums px-2.5 py-0.5 rounded-lg flex items-center leading-none ${
                  isCloseBettingActive
                    ? marketSide === "close"
                      ? "bg-white/20 text-white"
                      : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    : "bg-zinc-900 text-zinc-500"
                }`}
              >
                {isCloseBettingActive
                  ? formatCountdown(closeTimeRemaining)
                  : "Closed"}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bet Types Buttons */}
        <div className="flex gap-2">
          {(marketSide === "open"
            ? [BetType.OpenSingle, BetType.Pair, BetType.OpenTrio]
            : [BetType.CloseSingle, BetType.CloseTrio]
          ).map((bt) => {
            const isSelected = activeBetType === bt;
            return (
              <Button
                key={bt}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedBetType(bt);
                  setPick("");
                }}
                className={`flex-1 h-11 rounded-xl text-xs sm:text-sm font-heading font-bold cursor-pointer transition-all ${
                  isSelected
                    ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/25 scale-[1.02]"
                    : "border-zinc-800/90 bg-zinc-950/60 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 hover:border-zinc-700"
                }`}
              >
                {bt === BetType.OpenSingle || bt === BetType.CloseSingle
                  ? "Single (9x)"
                  : bt === BetType.Pair
                    ? "Pair (90x)"
                    : "Trio (140-600x)"}
              </Button>
            );
          })}
        </div>

        {/* Pick Input Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-300">Your Number Prediction</span>
            <span className="font-mono text-zinc-400 font-medium">
              {activeBetType === BetType.OpenSingle ||
              activeBetType === BetType.CloseSingle
                ? "Digit 0–9"
                : activeBetType === BetType.Pair
                  ? "Digits 00–99"
                  : "000–999 (Genie-sorted)"}
            </span>
          </div>

          {/* Single: digit buttons (0-9) */}
          {(activeBetType === BetType.OpenSingle ||
            activeBetType === BetType.CloseSingle) && (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 10 }, (_, i) => {
                const isPicked = pick === i.toString();
                return (
                  <Button
                    key={i}
                    type="button"
                    variant={isPicked ? "default" : "outline"}
                    onClick={() => setPick(i.toString())}
                    className={`h-13 rounded-xl font-mono text-xl font-extrabold tabular-nums cursor-pointer transition-all duration-200 ${
                      isPicked
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border-violet-500 scale-[1.04]"
                        : "border-zinc-800/90 bg-zinc-950/70 text-zinc-200 hover:border-violet-500/40 hover:bg-zinc-900"
                    }`}
                  >
                    {i}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Pair / Trio: Input */}
          {(activeBetType === BetType.Pair || isTrioBet) && (
            <div className="space-y-1.5">
              <Input
                type="number"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                placeholder={activeBetType === BetType.Pair ? "e.g. 42" : "e.g. 123"}
                min={0}
                max={getPickMax()}
                className="h-13 rounded-xl bg-zinc-950/90 border-zinc-800 font-mono text-lg font-bold tabular-nums text-white focus:border-violet-500 shadow-inner"
              />
              {isTrioBet && pick !== "" && !isPickValid && (
                <p className="text-xs text-red-400">
                  Trio must be in Genie-sorted order (1 &lt; 2 &lt; ... &lt; 9 &lt; 0)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Wager Input Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-zinc-300">Wager Amount</span>
            {balance !== undefined && (
              <span className="font-mono text-zinc-400 font-semibold tabular-nums">
                Available: {formatUsdcDollar(balance)}
              </span>
            )}
          </div>

          {/* Integrated input container with currency badge & MAX button */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none">
              <Badge
                variant="outline"
                className="font-mono text-xs border-zinc-700/80 bg-zinc-800/90 text-zinc-200 px-2.5 py-0.5 font-bold"
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
              className="h-13 rounded-xl bg-zinc-950/90 border-zinc-800 pl-22 pr-18 font-mono text-lg font-bold text-white focus:border-violet-500 shadow-inner"
            />
            <div className="absolute right-2 flex items-center">
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
                className="h-9 px-3 rounded-lg font-mono text-xs font-extrabold text-violet-300 bg-violet-500/15 hover:bg-violet-500/25 hover:text-white cursor-pointer"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Real-time potential return projection directly underneath input */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-950/70 border border-zinc-800/80 px-4 py-2.5 text-xs">
            <span className="text-zinc-400 font-medium">
              Potential Return ({multiplier}x multiplier):
            </span>
            <span className="font-mono text-base font-extrabold tabular-nums text-emerald-400">
              {potentialPayout}
            </span>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 pt-1">
            {QUICK_AMOUNTS.map((amt) => (
              <Button
                key={amt}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWager(amt)}
                className={`flex-1 font-mono text-xs sm:text-sm font-bold tabular-nums h-10 rounded-xl border-zinc-800/90 cursor-pointer transition-all ${
                  wager === amt
                    ? "bg-violet-600/25 text-violet-200 border-violet-500/50 shadow-sm"
                    : "bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-700"
                }`}
              >
                ${amt}
              </Button>
            ))}
          </div>
        </div>

        {/* Gas Sponsorship Indicator */}
        {authenticated && isEmbedded && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300 shadow-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap className="h-4 w-4 text-emerald-400" />
              Gasless Betting Active
            </span>
            <span className="text-xs font-mono text-emerald-400/90 font-bold">Sponsored by Genie</span>
          </div>
        )}

        {authenticated && !isEmbedded && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>External wallet connected: Sepolia ETH required for gas</span>
          </div>
        )}

        {/* Action Button with Web3 Pending States */}
        {!ready ? (
          <Button disabled className="w-full h-13 rounded-xl bg-zinc-900 text-zinc-600">
            Loading Wallet…
          </Button>
        ) : !authenticated ? (
          <Button
            onClick={login}
            className="w-full h-13 rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-purple-600 font-bold font-heading text-base text-white shadow-xl shadow-violet-600/25 hover:from-violet-500 hover:to-purple-500 cursor-pointer"
          >
            <Wallet className="h-4 w-4" />
            Sign In to Play
          </Button>
        ) : !hasBalance ? (
          <Button
            onClick={handleAddFunds}
            className="w-full h-13 rounded-xl gap-2 animate-pulse bg-gradient-to-r from-violet-600 to-purple-600 font-bold font-heading text-base text-white shadow-xl shadow-violet-600/25 hover:from-violet-500 hover:to-purple-500 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Fund Wallet to Play
          </Button>
        ) : step === "approving" ? (
          <Button
            disabled
            className="w-full h-13 rounded-xl gap-2 bg-violet-600/60 font-semibold text-white/80"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Approving USDC in Wallet…
          </Button>
        ) : step === "betting" ? (
          <Button
            disabled
            className="w-full h-13 rounded-xl gap-2 bg-violet-600/60 font-semibold text-white/80"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirming Bet onchain…
          </Button>
        ) : !isMarketOpenForBet ? (
          <Button
            disabled
            className="w-full h-13 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500"
          >
            {isOpenBet ? "Open Market Cutoff Passed" : "Close Market Cutoff Passed"}
          </Button>
        ) : (
          <Button
            onClick={handlePlaceBet}
            disabled={!isPickValid || !isWagerValid}
            className="w-full h-13 rounded-xl gap-2 bg-gradient-to-r from-violet-600 to-purple-600 font-bold font-heading text-base text-white shadow-xl shadow-violet-600/30 hover:from-violet-500 hover:to-purple-500 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:shadow-none cursor-pointer transition-all active:scale-[0.99]"
          >
            <ShieldCheck className="h-5 w-5" />
            Place Prediction ({BET_TYPE_LABELS[activeBetType]})
          </Button>
        )}

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
