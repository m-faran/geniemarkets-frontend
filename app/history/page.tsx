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
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { ClaimCard } from "@/components/claim-card";

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
  const totalPages = Math.ceil(totalRounds / ROUNDS_PER_PAGE);

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
          <History className="h-8 w-8 text-violet-400" />
          Round History
        </h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Browse historical protocol rounds, Chainlink VRF outcomes, and winning numbers.
        </p>
      </div>

      <ClaimCard />

      {isLoading ? (
        <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-3">
          <Skeleton className="h-8 w-full bg-zinc-800/50" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-zinc-800/40" />
          ))}
        </Card>
      ) : totalRounds === 0 ? (
        <Card className="bg-zinc-900/60 border-zinc-800 p-12 text-center text-zinc-500">
          No rounds recorded yet.
        </Card>
      ) : (
        <Card className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-4 py-3.5">Round</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Open Draw</th>
                  <th className="px-4 py-3.5 text-center">Close Draw</th>
                  <th className="px-4 py-3.5 text-center">Winning Pair</th>
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
                      <td className="px-4 py-3.5 font-mono text-sm font-semibold text-white tabular-nums">
                        #{id.toString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] font-semibold border-zinc-800 ${PHASE_COLORS[phase]}`}
                        >
                          {PHASE_LABELS[phase]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {showOpen ? (
                          <div className="font-mono tabular-nums">
                            <span className="text-sm font-medium text-white">
                              {openD1}-{openD2}-{openD3}
                            </span>
                            <span className="ml-2 text-xs font-bold text-violet-400">
                              ({openSingle})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {showClose ? (
                          <div className="font-mono tabular-nums">
                            <span className="text-sm font-medium text-white">
                              {closeD1}-{closeD2}-{closeD3}
                            </span>
                            <span className="ml-2 text-xs font-bold text-blue-400">
                              ({closeSingle})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {showClose ? (
                          <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                            {pairResult.toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">—</span>
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
            <div className="border-t border-zinc-800 p-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="gap-1 border-zinc-800 text-xs font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                Newer
              </Button>
              <span className="text-xs font-mono text-zinc-400 tabular-nums">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="gap-1 border-zinc-800 text-xs font-medium"
              >
                Older
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
