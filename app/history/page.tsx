"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import {
  RoundPhase,
  PHASE_LABELS,
  PHASE_COLORS,
} from "@/lib/utils";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  ChevronLeft,
  ChevronRight,
  Hash,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const ROUNDS_PER_PAGE = 10;

export function HistoryPageContent() {
  const [page, setPage] = useState(0);

  // Get current round ID
  const { data: currentRoundId } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_currentRoundId",
  });

  const totalRounds = currentRoundId ? Number(currentRoundId as bigint) : 0;
  const totalPages = Math.max(1, Math.ceil(totalRounds / ROUNDS_PER_PAGE));

  // Calculate which round IDs to fetch for this page (newest first)
  const roundIds = useMemo(() => {
    if (totalRounds === 0) return [];
    const start = totalRounds - page * ROUNDS_PER_PAGE;
    const end = Math.max(1, start - ROUNDS_PER_PAGE + 1);
    return Array.from({ length: start - end + 1 }, (_, i) =>
      BigInt(start - i)
    );
  }, [totalRounds, page]);

  // Multicall to fetch all round data
  const roundCalls = useMemo(
    () =>
      roundIds.map((id) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "s_rounds" as const,
        args: [id] as const,
      })),
    [roundIds]
  );

  const { data: roundsData, isLoading } = useReadContracts({
    contracts: roundCalls,
    query: { enabled: roundCalls.length > 0 },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-xl shadow-violet-600/20">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Round History
            </h1>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
              Browse historical protocol rounds, Chainlink VRF verified outcomes, and winning numbers.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="self-start sm:self-auto border-violet-500/30 bg-violet-500/10 text-violet-300 font-mono text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          Onchain Archive
        </Badge>
      </div>

      {/* Metric Overview HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Rounds */}
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-5 shadow-lg shadow-black/20 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
            <Hash className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-medium text-zinc-400">Total Rounds</span>
            <p className="font-mono text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              #{totalRounds}
            </p>
            <span className="text-[11px] text-zinc-500 font-mono">Sonic EVM Blockchain</span>
          </div>
        </Card>

        {/* Card 2: VRF Engine */}
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-5 shadow-lg shadow-black/20 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-medium text-zinc-400">Randomness Engine</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-heading text-lg sm:text-xl font-bold text-white">
                Chainlink VRF v2.5
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">
              Tamper-proof onchain entropy
            </span>
          </div>
        </Card>

        {/* Card 3: Settlement Cadence */}
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-5 shadow-lg shadow-black/20 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-heading font-medium text-zinc-400">Draw Cadence</span>
            <p className="font-heading text-lg sm:text-xl font-bold text-white mt-0.5">
              Daily 24h Cycles
            </p>
            <span className="text-[11px] text-zinc-500 font-mono">Open & Close market draws</span>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      {isLoading ? (
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-7 space-y-4 shadow-xl shadow-black/30">
          <Skeleton className="h-10 w-full bg-zinc-800/50 rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-zinc-800/40 rounded-xl" />
          ))}
        </Card>
      ) : totalRounds === 0 ? (
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-12 text-center text-zinc-400 shadow-xl space-y-3">
          <History className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="font-heading font-bold text-lg text-white">No Rounds Recorded Yet</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Once round #1 is initialized and begins running, historical draws and settlement outcomes will appear here.
          </p>
        </Card>
      ) : (
        <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 shadow-xl shadow-black/30 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/90 bg-zinc-950/90 text-xs font-heading font-extrabold uppercase tracking-wider text-zinc-300">
                  <th className="px-6 py-4.5">Round</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-center">Open Draw (3 Digits & Single)</th>
                  <th className="px-6 py-4.5 text-center">Close Draw (3 Digits & Single)</th>
                  <th className="px-6 py-4.5 text-center">Winning Pair</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {roundIds.map((id, i) => {
                  const result = roundsData?.[i];
                  if (result?.status !== "success" || !result.result)
                    return null;

                  const r = result.result as readonly unknown[];
                  const phase = Number(r[0]) as RoundPhase;
                  const openD1 = Number(r[6]);
                  const openD2 = Number(r[7]);
                  const openD3 = Number(r[8]);
                  const closeD1 = Number(r[9]);
                  const closeD2 = Number(r[10]);
                  const closeD3 = Number(r[11]);
                  const openSingle = Number(r[12]);
                  const closeSingle = Number(r[13]);
                  const pairResult = Number(r[14]);

                  const showOpen =
                    phase >= RoundPhase.CloseBetting &&
                    phase !== RoundPhase.Cancelled;
                  const showClose = phase >= RoundPhase.Settled;

                  return (
                    <tr
                      key={id.toString()}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-6 py-5 font-mono">
                        <span className="inline-flex h-11 px-4 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800/90 font-mono font-black text-base text-white tabular-nums shadow-inner">
                          #{id.toString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-extrabold h-10 px-4 rounded-xl border-zinc-800/90 bg-zinc-950/90 shadow-sm inline-flex items-center gap-2 ${PHASE_COLORS[phase]}`}
                        >
                          {phase === RoundPhase.Settled ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : phase === RoundPhase.OpenBetting ? (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                          ) : null}
                          {PHASE_LABELS[phase]}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {showOpen ? (
                          <div className="inline-flex items-center justify-center gap-3 font-mono tabular-nums">
                            <span className="font-mono text-base font-black tracking-widest text-white px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 shadow-inner">
                              {openD1} · {openD2} · {openD3}
                            </span>
                            <span className="font-mono text-xs font-black px-3.5 py-2 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-lg shadow-violet-500/15 flex items-center gap-1.5">
                              <span className="text-[10px] font-sans uppercase font-bold text-violet-300/80">Single</span>
                              <span className="text-base font-black text-white">{openSingle}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs font-mono text-zinc-500">
                            Awaiting Draw
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {showClose ? (
                          <div className="inline-flex items-center justify-center gap-3 font-mono tabular-nums">
                            <span className="font-mono text-base font-black tracking-widest text-white px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 shadow-inner">
                              {closeD1} · {closeD2} · {closeD3}
                            </span>
                            <span className="font-mono text-xs font-black px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/15 flex items-center gap-1.5">
                              <span className="text-[10px] font-sans uppercase font-bold text-blue-300/80">Single</span>
                              <span className="text-base font-black text-white">{closeSingle}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs font-mono text-zinc-500">
                            Awaiting Draw
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {showClose ? (
                          <span className="font-mono text-lg font-black text-amber-300 tabular-nums px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 shadow-xl shadow-amber-500/20 inline-flex items-center justify-center tracking-wide">
                            {pairResult.toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs font-mono text-zinc-500">
                            Awaiting Draw
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-800/90 bg-zinc-950/80 p-4 px-6 flex items-center justify-between flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-10 px-4 rounded-xl border-zinc-800 bg-zinc-950/80 hover:bg-zinc-800 hover:text-white text-zinc-300 font-heading font-bold text-xs gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Newer Rounds
              </Button>
              <span className="text-xs font-mono text-zinc-400 font-semibold tabular-nums">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-10 px-4 rounded-xl border-zinc-800 bg-zinc-950/80 hover:bg-zinc-800 hover:text-white text-zinc-300 font-heading font-bold text-xs gap-1.5 transition-colors cursor-pointer"
              >
                Older Rounds
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return <HistoryPageContent />;
}

