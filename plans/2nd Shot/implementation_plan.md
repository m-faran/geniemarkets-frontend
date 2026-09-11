# Implementation Plan: Round Settlement, Draw Timing & Claims Portal

The Genie Markets frontend currently lacks critical round lifecycle controls, provides incomplete timing indicators, artificially restricts Close market bets during the Open timeframe, and fails to surface claimable winnings from settled past rounds.

This plan addresses these deficiencies by aligning frontend behavior with the onchain rules defined in [GenieMarkets.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMarkets.sol) and [DeployGenieMarkets.s.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/DeployGenieMarkets.s.sol).

---

## Key Smart Contract Realities Discovered

1. **Dual Cutoffs per Round**:
   - `openCutoff = roundStartTime + openDuration` (configured as 21 hours in deploy script).
   - `closeCutoff = roundStartTime + openDuration + closeDuration` (configured as 24 hours total, 3h close window).
2. **Close Bets Are Valid During the Open Window**:
   - In `placeBet()`: Close bets (`CloseSingle` and `CloseTrio`) are valid whenever `phase` is `OpenBetting`, `OpenPending`, or `CloseBetting`, provided `block.timestamp < round.closeCutoff`.
   - The UI currently hides Close bets during `OpenBetting` and disables betting when `openCutoff` elapses. This artificial restriction must be removed.
3. **External Settlement Triggers Required**:
   - Chainlink VRF draws are **permissionless** and require an external transaction:
     - `requestOpenDraw(roundId)`: Callable by anyone once `block.timestamp >= round.openCutoff` and `round.phase == OpenBetting`.
     - `requestCloseDraw(roundId)`: Callable by anyone once `block.timestamp >= round.closeCutoff` and `round.phase == CloseBetting`.
     - `cancelStaleRound(roundId)`: Emergency fallback if VRF has been stuck in pending for > 24 hours (`EMERGENCY_TIMEOUT`).
   - If nobody triggers these functions, a round remains stuck indefinitely even if 24+ hours have elapsed. The UI has zero controls for this today.
4. **Settled Rounds Are Always Historical**:
   - When `fulfillRandomWords` completes the Close draw, it sets `round.phase = Settled` and immediately calls `_initNextRound()`, advancing `s_currentRoundId` to `roundId + 1`.
   - As a result, `s_currentRoundId` is **never** in the `Settled` phase.
   - The existing `ClaimCard` checked only `s_currentRoundId` for `phase === Settled`, making it impossible for users to claim winnings from settled rounds. Users have 30 days (`CLAIM_PERIOD = 30 days`) to claim winnings or refunds from past settled rounds (`roundId - 1`, etc.).

---

## User Review Required

> [!IMPORTANT]
> **Draw Execution & Gas Sponsorship**:
> `requestOpenDraw` and `requestCloseDraw` are permissionless onchain transactions. In this plan, we provide one-click buttons for any user or admin directly in the UI when cutoffs are reached. Transactions will use the existing Privy `sendTransaction` flow with gas sponsorship enabled (`sponsor: true`), so nobody needs Sepolia ETH to advance the round.

> [!NOTE]
> **Claims Architecture**:
> Because settled rounds are historical (`s_currentRoundId - 1`, etc.), claims should scan recent settled rounds (defaulting to the past 10 rounds or all rounds if total is small). We will provide:
> 1. A prominent **Unclaimed Winnings / Refund Banner & Action Card** on the Play page for all claimable rounds.
> 2. Direct claim buttons next to user bets on the **Round History** page (`/history`).

---

## Proposed Changes

### 1. Timing & Round State Architecture

#### [MODIFY] [use-current-round.ts](file:///home/faran/foundry-projects/geniemarkets-frontend/hooks/use-current-round.ts)
- Replace single `timeRemaining` with distinct state for both markets:
  - `openTimeRemaining`: seconds until `round.openCutoff` (0 if passed)
  - `closeTimeRemaining`: seconds until `round.closeCutoff` (0 if passed)
  - `isOpenCutoffPassed`: boolean (`now >= round.openCutoff`)
  - `isCloseCutoffPassed`: boolean (`now >= round.closeCutoff`)
  - `isOpenBettingActive`: `round.phase === RoundPhase.OpenBetting && !isOpenCutoffPassed`
  - `isCloseBettingActive`: `(round.phase === RoundPhase.OpenBetting || round.phase === RoundPhase.OpenPending || round.phase === RoundPhase.CloseBetting) && !isCloseCutoffPassed`
  - `isOpenDrawReady`: `round.phase === RoundPhase.OpenBetting && isOpenCutoffPassed`
  - `isCloseDrawReady`: `round.phase === RoundPhase.CloseBetting && isCloseCutoffPassed`
  - `isOverdue`: `round.phase === RoundPhase.OpenBetting && isCloseCutoffPassed` (indicates round has exceeded total duration without Open draw being called)

---

### 2. Settlement & Draw Request Actions

#### [NEW] [use-round-actions.ts](file:///home/faran/foundry-projects/geniemarkets-frontend/hooks/use-round-actions.ts)
- Implement hook with permissionless lifecycle methods using Privy's `sendTransaction` (sponsored):
  - `requestOpenDraw(roundId: bigint)`: calls contract `requestOpenDraw(roundId)`.
  - `requestCloseDraw(roundId: bigint)`: calls contract `requestCloseDraw(roundId)`.
  - `cancelStaleRound(roundId: bigint)`: calls contract `cancelStaleRound(roundId)` if stuck in pending > 24h.
- Manage execution steps (`idle`, `triggering`, `success`, `error`) and refetch round state upon confirmation.

---

### 3. Display & Clarity on Settlement / Draws

#### [MODIFY] [round-display.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/round-display.tsx)
- Upgrade the round header and indicators:
  - **Dual Market Timers**: Display separate status indicators and timers for Open Market vs Close Market.
  - **Settlement / Draw Action Card**:
    - When `isOpenDrawReady` is true: show a clear alert badge and a **"Trigger Open Draw (VRF)"** button.
    - When `isCloseDrawReady` is true: show a **"Settle Round / Trigger Close Draw"** button.
    - If round is overdue (e.g. > 24h elapsed and still in `OpenBetting`): show an explanatory alert ("Round cutoff elapsed; trigger Open Draw to proceed to settlement").
    - If in pending state for > 24h: show emergency "Cancel Stale Round" button.
  - **Previous Round Quick Summary**: Query and display the results of `roundId - 1` (last settled round) if available, so users can see the outcome of the round that just ended.

---

### 4. Decoupled Betting Panel (Enable Close Bets in Open Window)

#### [MODIFY] [bet-panel.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/bet-panel.tsx)
- Decouple market selection:
  - Allow selecting between **Open Market** (`OpenSingle`, `OpenTrio`, `Pair`) and **Close Market** (`CloseSingle`, `CloseTrio`).
  - Open Market bets are allowed if `isOpenBettingActive` is true.
  - Close Market bets are allowed whenever `isCloseBettingActive` is true (even during `OpenBetting` and `OpenPending`).
  - Show contextual status:
    - If Open market is closed but Close market is active: Open bets are disabled with label "Open Cutoff Passed", but Close bets can still be placed.
    - Button text reflects selected market state (e.g., "Place Bet", "Open Market Closed", "Close Market Closed").

---

### 5. Claims System & User Bets Across Rounds

#### [MODIFY] [use-user-bets.ts](file:///home/faran/foundry-projects/geniemarkets-frontend/hooks/use-user-bets.ts)
- Support fetching bets for specified rounds or recent historical rounds.
- Use `useAccount().address` (falling back to Privy wallet address) to ensure correct address matching.
- Add `useUnclaimedBets()` hook or extension that scans settled past rounds (`currentRoundId - 1` down to max 10 past rounds) to locate all unclaimed winning bets and refundable bets.

#### [MODIFY] [claim-card.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/claim-card.tsx)
- Update `ClaimCard` on `/play` to show **all unclaimed winnings and refunds across settled past rounds** instead of only querying `currentRoundId`.
- Display round number, pick, payout amount, and a direct "Claim" button for each winning/refundable bet.
- Add a summary total (e.g., "Total Unclaimed: $180.00 USDC").

#### [MODIFY] [history/page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/history/page.tsx)
- Enhance history rows with user's bet status:
  - Highlight rounds where the user placed bets.
  - Provide a claim button directly in the history row for any settled round with unclaimed winnings or refunds.

---

## Verification Plan

### Automated / Code Quality
- Run `npm run lint` and `npx tsc --noEmit` to verify TypeScript types, Next.js build constraints, and clean linting.

### Manual Verification
- Test dual timers: confirm Open and Close countdowns display correct relative times according to `openCutoff` and `closeCutoff`.
- Test Close betting during Open window: verify selecting `CloseSingle` or `CloseTrio` allows placing bets even when `round.phase == OpenBetting`.
- Test Draw Trigger buttons: verify that when cutoff has passed, the button appears, triggers the contract call with gas sponsorship, and updates round state to `OpenPending` / `ClosePending`.
- Test Claims: verify historical settled rounds (`roundId - 1`) are queried, displaying user's winning/refundable bets with functioning Claim buttons.
