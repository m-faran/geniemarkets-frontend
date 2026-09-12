# Expose `claimWinnings`, `claimRefund`, and `cancelStaleRound` on the Play Page

## Background & Problem Analysis
In `GenieMarkets.sol` (lines 332–423), three essential lifecycle and settlement functions exist:
1. `claimWinnings(uint256 roundId, uint256 betIndex)`: Pull-based claiming of winnings for winning bets within 30 days of round settlement.
2. `claimRefund(uint256 roundId, uint256 betIndex)`: Pull-based claiming of USDC refunds for wagers in cancelled rounds or partially-settled rounds (Close/Pair bets when Close VRF stalls).
3. `cancelStaleRound(uint256 roundId)`: Permissionless emergency fallback. If Chainlink VRF stalls in `OpenPending` or `ClosePending` for over 24 hours (`EMERGENCY_TIMEOUT`), anyone can call this to cancel or partially settle the round and initialize the next round.

### Why They Currently Appear Missing from the Play Page (`/play`):
1. **`ClaimCard` auto-hides**: In [components/claim-card.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/claim-card.tsx), line 29 executes `if (!hasClaims && step !== "success") return null;`. Because test rounds are often in betting phase or a user hasn't yet won a settled round, this entire component disappears, giving users zero visibility into winnings claims or refunds.
2. **`PlacedBets` misses refunds**: In [components/placed-bets.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/placed-bets.tsx), only settled winning bets show a claim button. If a round is `Cancelled` or `PartiallySettled`, refundable bets are marked as `Closed` with no `Claim Refund` button.
3. **`cancelStaleRound` is conditionally hidden**: In [components/round-display.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/round-display.tsx), the stale round button only renders under the strict condition `isEmergencyStale` (when current phase is pending VRF and >24 hours have elapsed). During normal betting phases, there is zero UI affordance or manual control to invoke `cancelStaleRound(roundId)`.

---

## User Review Required

> [!IMPORTANT]
> **Persistent vs. Conditional UI**:
> Rather than having claims and emergency controls disappear when inactive, we will make both:
> 1. **Claims & Refunds**: A persistent, dedicated card on `/play` that always displays the player's claim/refund status, auto-scanned winnings/refunds, and includes a **Manual Claim & Refund** utility (`Round ID` + `Bet Index`).
> 2. **Emergency VRF Recovery (`cancelStaleRound`)**: A dedicated section/tool on `/play` (in the sidebar or collapsible card) displaying VRF health, emergency timeout status, and a direct `cancelStaleRound` trigger by Round ID.

---

## Proposed Changes

### 1. Claims & Refunds Section

#### [MODIFY] [components/claim-card.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/claim-card.tsx)
- Remove `if (!hasClaims && step !== "success") return null;`.
- When the user is connected but has 0 pending claims, display a clean, reassuring "Claims & Refunds" status card:
  - Explains the 30-day pull-based claim mechanism from `GenieMarkets.sol`.
  - Shows "No Unclaimed Winnings or Refunds" status with a quick refresh button.
- When winning bets or refundable bets are detected:
  - Display winning cards with gold accents and a prominent **"Claim Winnings"** button calling `claimWinnings(roundId, betIndex)`.
  - Display refundable cards with blue/amber accents and a prominent **"Claim Refund"** button calling `claimRefund(roundId, betIndex)`.
- Add an expandable **"Manual Claim & Refund"** utility:
  - Input fields for `Round ID` and `Bet Index`.
  - Action buttons for **"Claim Winnings"** and **"Claim Refund"**.
  - Direct execution via `useClaim()`, enabling immediate claim verification or recovery of older rounds outside the auto-scan window.

---

### 2. User Placed Bets Integration

#### [MODIFY] [components/placed-bets.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/placed-bets.tsx)
- Update the action column in each bet card to support refunds:
  - Detect if the bet's round is `RoundPhase.Cancelled` or (`RoundPhase.PartiallySettled` and Close/Pair bet).
  - If refundable and `!bet.claimed`, render a **"Claim Refund"** button calling `claimRefund(bet.roundId, bet.betIndex)`.
  - If already claimed, display "Refund Claimed" badge.
  - Maintain the existing **"Claim Winnings"** button for settled winning bets.

---

### 3. Emergency VRF Recovery (`cancelStaleRound`)

#### [NEW] [components/emergency-recovery.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/emergency-recovery.tsx)
- Build a dedicated, compact Emergency Recovery component for `/play`:
  - **Contract Explanation**: Clearly documents `cancelStaleRound(uint256 roundId)`:
    - Open VRF stall > 24h: Cancels round, enables 100% wager refunds, starts next round.
    - Close VRF stall > 24h: Partially settles round, enables Open winnings claims & Close wager refunds, starts next round.
  - **Active Round VRF Monitor**:
    - Displays current round VRF status.
    - If in `OpenPending` or `ClosePending`, shows elapsed time and countdown to the 24h stale cutoff.
    - When `isEmergencyStale` is true, displays a highlighted one-click **"Cancel Stale Round #{currentRoundId}"** button.
  - **Manual Recovery by Round ID**:
    - Input for `Round ID` (defaults to current round).
    - Button: **"Cancel Stale Round"** invoking `cancelStaleRound(roundId)`.
    - Handles contract errors/reverts (e.g., `NotStaleYet()`, `RoundNotPending()`) with clear user-friendly notifications.

#### [MODIFY] [components/round-display.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/round-display.tsx)
- Enhance the VRF pending banner when in `OpenPending` or `ClosePending` to show the emergency countdown timer (`24h Timeout`).
- Ensure the existing stale recovery alert seamlessly reflects the same recovery state.

---

### 4. Play Page Integration

#### [MODIFY] [app/play/page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/play/page.tsx)
- Add `EmergencyRecovery` component into the `/play` layout (in the sidebar below `WalletPanel`, keeping the main betting and claims flow clean and structured).
- Ensure `ClaimCard` is rendered prominently in the main column under `PlacedBets`.

---

## Verification Plan

### Automated Tests
- Run TypeScript type checks:
  ```bash
  npx tsc --noEmit
  ```
- Run ESLint:
  ```bash
  npm run lint
  ```

### Manual Verification
- Open the Play page at `http://localhost:3000/play`:
  1. **Claims & Refunds Section**:
     - Verify the Claims card is visible when connected, showing zero pending claims state, claim rules, and the "Manual Claim & Refund" utility.
     - Test inputting a `Round ID` and `Bet Index` and clicking "Claim Winnings" and "Claim Refund" to verify contract call invocation.
  2. **Placed Bets**:
     - Check placed bets list in settled or cancelled rounds to verify "Claim Winnings" and "Claim Refund" buttons appear appropriately.
  3. **Emergency Recovery (`cancelStaleRound`)**:
     - Verify the Emergency Recovery card is rendered in the sidebar.
     - Test entering a round ID and clicking "Cancel Stale Round" — verify transaction prompt is triggered and correct contract revert feedback (e.g., `RoundNotPending` or `NotStaleYet`) is gracefully reported if not yet stale.
