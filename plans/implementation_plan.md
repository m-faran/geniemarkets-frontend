# Implementation Plan: Hidden Admin Portal (`/admin`)

Implement a dedicated, hidden Admin Dashboard at route `/admin` (not linked in navigation or footer) providing complete administrative controls for all `onlyOwner` and operational functions defined in [GenieMarkets.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMarkets.sol) and [GenieMarkets_abi.json](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMarkets_abi.json).

---

## User Review Required

> [!IMPORTANT]
> **Owner-Gated Security**:
> The `/admin` page will be hidden from the navigation bar. Upon visiting `/admin`, the page reads `owner()` directly from the smart contract:
> - If unauthenticated: prompts the user to sign in with Privy.
> - If authenticated wallet is **not** the contract owner: renders an "Unauthorized Access" screen showing the connected address and the required owner address, locking all administrative actions.
> - If authenticated wallet **is** the contract owner: unlocks full admin controls.

> [!NOTE]
> **Gas Sponsorship for Admin Operations**:
> Admin transactions (bankroll deposit/withdraw, duration updates, VRF settings, round controls) will use the existing sponsored transaction pipeline (`sponsor: true`), so the admin does not need Sepolia ETH for gas.

---

## Proposed Changes

### 1. Smart Contract Interface Updates

#### [MODIFY] [contracts.ts](file:///home/faran/foundry-projects/geniemarkets-frontend/lib/contracts.ts)
- Add missing administrative ABI declarations to `genieMarketsAbi`:
  - `owner()` view returns `address`
  - `depositBankroll(uint256 amount)`
  - `withdrawBankroll(uint256 amount)`
  - `setDurations(uint32 _openDuration, uint32 _closeDuration)`
  - `setCoordinator(address _vrfCoordinator)`
  - `transferOwnership(address to)`
  - `acceptOwnership()`
  - View immutables: `s_vrfCoordinator()`, `i_subscriptionId()`, `i_callbackGasLimit()`, `i_keyHash()`
  - Events: `BankrollDeposited`, `BankrollWithdrawn`, `DurationsUpdated`, `OwnershipTransferRequested`, `OwnershipTransferred`

---

### 2. Admin Logic Hook

#### [NEW] [use-admin-actions.ts](file:///home/faran/foundry-projects/geniemarkets-frontend/hooks/use-admin-actions.ts)
Implement custom hook encapsulating all administrative smart contract interactions:
- `depositBankroll(amount: string)`: Handles 2-step USDC approval + `depositBankroll(amount)`.
- `withdrawBankroll(amount: string)`: Calls `withdrawBankroll(amount)`.
- `setDurations(openSecs: number, closeSecs: number)`: Calls `setDurations(openSecs, closeSecs)`.
- `setCoordinator(newCoordinator: Address)`: Calls `setCoordinator(newCoordinator)`.
- `transferOwnership(newOwner: Address)`: Calls `transferOwnership(newOwner)`.
- `acceptOwnership()`: Calls `acceptOwnership()`.
- State management for execution steps (`idle`, `approving`, `submitting`, `success`, `error`) and error messages.

---

### 3. Admin UI Components & Page

#### [NEW] [admin-content.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/admin/admin-content.tsx)
The main admin dashboard component:
1. **Access Gate & Owner Verification**:
   - Checks connected wallet against contract `owner()`.
   - Displays "Admin Verified" badge with owner address and connected wallet.
2. **Bankroll Management**:
   - Displays total contract USDC balance (`balanceOf(GENIE_MARKETS_ADDRESS)`) and admin's personal USDC balance.
   - **Deposit Bankroll Card**: Quick presets ($100, $500, $1,000, $5,000) or custom USDC amount with automated approve & deposit.
   - **Withdraw Bankroll Card**: Amount input with "Max" button and safe confirmation prompt.
3. **Round Durations Configuration**:
   - Displays current `s_openDuration` and `s_closeDuration` (formatted into hours/minutes).
   - Form to update Open and Close durations with presets (e.g. "Standard 21h/3h (24h)", "Quick Test 10m/5m", "Custom").
   - Clear notice that duration updates take effect starting with the next round.
4. **Round Lifecycle & Draw Triggers**:
   - Live status of `s_currentRoundId`, phase, cutoffs, and bet count.
   - One-click trigger buttons for `requestOpenDraw` and `requestCloseDraw` when cutoffs elapse.
   - Emergency `cancelStaleRound` action card if VRF has been pending > 24 hours.
5. **VRF & Protocol Parameters**:
   - Displays immutables (`s_vrfCoordinator`, `i_subscriptionId`, `i_callbackGasLimit`, `i_keyHash`, `CLAIM_PERIOD`, `EMERGENCY_TIMEOUT`).
   - Action to update VRF Coordinator address (`setCoordinator`).
6. **Contract Ownership (2-Step)**:
   - Initiate ownership transfer to a new address (`transferOwnership`).
   - Claim ownership button (`acceptOwnership`) if current wallet is pending owner.

#### [NEW] [page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/admin/page.tsx)
- Server component with route `/admin` (hidden from navigation).
- Exports metadata: `{ title: "Admin Portal — Genie Markets", robots: "noindex, nofollow" }`.
- Renders `<AdminContent />`.

---

## Verification Plan

### Automated Tests & Type Safety
- Run `npx tsc --noEmit` to verify type safety of new ABI methods, hooks, and components.
- Run `npm run lint` to verify zero ESLint errors or warnings.

### Manual Verification
- Start Next.js dev server (`npm run dev`).
- Navigate to `http://localhost:3000/admin`.
- Verify the route is **not** present in the navbar or footer.
- Verify owner authentication state:
  - Disconnected: displays sign-in prompt.
  - Non-owner wallet: displays "Unauthorized Access" alert with owner address vs connected address.
  - Owner wallet: unlocks all admin controls.
- Verify Bankroll panel: displays live contract USDC balance and deposit/withdraw inputs.
- Verify Durations panel: displays current 21h / 3h values.
- Verify Round Lifecycle controls: displays current round ID and trigger states.
