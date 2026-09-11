# Genie Markets — Next.js Frontend Implementation Plan

A Next.js web app for the GenieMarkets onchain number prediction protocol, designed to win the **Privy prize track** at ETHGlobal Online 2026.

---

## User Review Required

> [!IMPORTANT]
> **Chain Selection**: Which chain is this deploying to? The contract uses Chainlink VRF, so it needs to be a chain with VRF support. The Privy `useAddFunds` and gas sponsorship need to target the same chain. I'm assuming **Base** (cheapest L2, great Privy support, VRF available). Confirm?

> [!IMPORTANT]
> **Privy App ID**: You'll need to create a Privy app at [dashboard.privy.io](https://dashboard.privy.io) and get an `appId`. We'll use an env var `NEXT_PUBLIC_PRIVY_APP_ID` for this. Have you created one yet, or should we use a placeholder?

> [!WARNING]
> **RainbowKit vs Privy's built-in UI**: Since Privy IS the core integration and already provides login modals + wallet management, RainbowKit adds a second "connect wallet" paradigm that may confuse users and dilute the Privy story for judges. My recommendation: **use Privy as the sole auth/wallet layer** and skip RainbowKit. We still use wagmi + viem underneath for contract reads/writes. If you specifically want RainbowKit's `ConnectButton` as an *additional* external wallet option, we can add it, but it shouldn't be the primary flow. Your call.

## Open Questions

> [!IMPORTANT]
> **Contract Address + USDC Address**: What are the deployed contract addresses? Or are we building against a local Anvil fork for now? We'll need `NEXT_PUBLIC_GENIE_MARKETS_ADDRESS` and `NEXT_PUBLIC_USDC_ADDRESS`.

> [!NOTE]
> **Bet Amounts**: Is there a minimum/maximum wager? The contract accepts any non-zero `uint128`. Should the UI enforce sensible defaults (e.g., $1, $5, $10, $25 quick-pick buttons)?

---

## Architecture Overview

```
frontend/                          # Next.js app (App Router)
├── app/
│   ├── layout.tsx                 # Root layout + Providers
│   ├── page.tsx                   # Landing / Hero → redirects to /play
│   ├── play/
│   │   └── page.tsx               # Main game screen (the core experience)
│   ├── history/
│   │   └── page.tsx               # Past rounds + user bet history
│   └── globals.css                # Design tokens + base styles
├── components/
│   ├── providers.tsx              # Privy + wagmi + QueryClient providers
│   ├── nav-bar.tsx                # Top nav: logo, wallet status, fund button
│   ├── round-display.tsx          # Current round phase + countdown + dice
│   ├── bet-panel.tsx              # Bet type selector + pick input + wager
│   ├── wallet-panel.tsx           # USDC balance, Add Funds, Transfer Out
│   ├── results-card.tsx           # Round results (open/close draws, payouts)
│   ├── claim-card.tsx             # Claim winnings / refund UI
│   ├── round-history.tsx          # Table of past rounds
│   └── ui/                       # shadcn/ui components (installed via CLI)
├── lib/
│   ├── contracts.ts               # ABI + address constants
│   ├── wagmi-config.ts            # wagmi config (chain, transports)
│   └── utils.ts                   # USDC formatting, phase labels, etc.
├── hooks/
│   ├── use-current-round.ts       # Read s_currentRoundId + s_rounds
│   ├── use-place-bet.ts           # USDC approve + placeBet flow
│   ├── use-claim.ts               # claimWinnings / claimRefund
│   └── use-user-bets.ts           # Fetch user's bets for a round (events)
├── public/
│   └── ...                        # Favicon, OG image, etc.
├── .env.local                     # NEXT_PUBLIC_PRIVY_APP_ID, contract addrs
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] `frontend/` directory

Initialize with:
```bash
npx -y create-next-app@latest ./frontend --ts --app --eslint --src-dir=false --import-alias="@/*" --tailwind=false --turbopack
```

Then install dependencies:
```bash
cd frontend
npm install @privy-io/react-auth @privy-io/wagmi wagmi viem @tanstack/react-query
npm install lucide-react
npx shadcn@latest init   # select default style, CSS variables, etc.
npx shadcn@latest add button card dialog input label select tabs badge separator toast sonner
```

> [!NOTE]
> We use vanilla CSS (no Tailwind) per your stack preference. shadcn/ui will be configured to use CSS variables and we'll customize the generated components' styles as needed. Actually — shadcn/ui **requires** Tailwind as a peer dependency. Since you've specified shadcn/ui, we'll include Tailwind but keep custom styling in CSS variables and use shadcn components as-is. This is the minimal Tailwind footprint.

---

### 2. Providers & Configuration

#### [NEW] [providers.tsx](file:///home/faran/foundry-projects/genie-markets/frontend/components/providers.tsx)

The provider hierarchy (order matters):
```
PrivyProvider → QueryClientProvider → WagmiProvider → children
```

- **Privy config**: `loginMethods: ['email', 'google', 'wallet']`, `embeddedWallets.createOnLogin: 'users-without-wallets'`, dark theme, custom accent color
- **wagmi config**: Created via `@privy-io/wagmi` with the target chain (Base), RPC transport
- Privy handles all auth — no separate RainbowKit provider needed (pending your decision above)

#### [NEW] [wagmi-config.ts](file:///home/faran/foundry-projects/genie-markets/frontend/lib/wagmi-config.ts)

- Chain: Base (or whatever you confirm)
- Transport: public HTTP fallback (+ Alchemy/Infura if you have a key)
- SSR: true, cookieStorage for Next.js hydration

#### [NEW] [contracts.ts](file:///home/faran/foundry-projects/genie-markets/frontend/lib/contracts.ts)

- Export the GenieMarkets ABI (from your [GenieMarkets_abi.json](file:///home/faran/foundry-projects/genie-markets/GenieMarkets_abi.json))
- Export ERC-20 ABI (minimal: `approve`, `allowance`, `balanceOf`, `decimals`)
- Export contract addresses from env vars
- Export typed contract config objects for wagmi's `useReadContract` / `useWriteContract`

---

### 3. Screens

#### Screen 1: Landing Page (`app/page.tsx`)

**Purpose**: Hero page that sells the product in 5 seconds and funnels users to `/play`.

**Content**:
- Animated hero with the Genie Markets brand — glowing dice/numbers visual
- Tagline: "Predict. Play. Win up to 600x." (referencing `JACKPOT_TRIO_PAYOUT`)
- Quick explanation of the 5 bet types with payout multipliers
- Large CTA button: "Start Playing" → routes to `/play`
- If user is already logged in (Privy), CTA says "Go to Game"

**Privy integration**: None yet — this is the hook page.

---

#### Screen 2: Play Page (`app/play/page.tsx`) — **The Core Experience**

This is where 90% of the Privy integration lives. Split into logical panels:

##### 2a. Nav Bar (`components/nav-bar.tsx`)
- Logo (left)
- Wallet status chip (right): shows truncated address + USDC balance
- If not logged in: "Sign In" button → triggers `login()` from Privy
- If logged in but zero USDC: pulsing "Add Funds" button → triggers `addFunds()` from Privy's `useAddFunds`
- If logged in with balance: shows balance + subtle "Add Funds" link

##### 2b. Round Display (`components/round-display.tsx`)
- Reads `s_currentRoundId` and `s_rounds[currentRoundId]` via wagmi
- Shows current **phase** as a visual state machine:
  - `OpenBetting` → "OPEN bets live" + countdown to `openCutoff`
  - `OpenPending` → "Drawing OPEN numbers..." + spinner
  - `CloseBetting` → "CLOSE bets live" + countdown to `closeCutoff` + shows Open draw results
  - `ClosePending` → "Drawing CLOSE numbers..." + spinner
  - `Settled` → Shows all results + pair derivation
- Animated dice/number reveal when draws are fulfilled (poll or event subscription)
- Countdown timer component using `openCutoff` / `closeCutoff` timestamps

##### 2c. Bet Panel (`components/bet-panel.tsx`)
The main interaction area. Only shows bet types valid for the current phase.

**During OpenBetting phase**:
- Tabs: `Open Single` | `Open Trio` | `Pair`
- Pick input: digit selector (0-9 for Single, 3-digit sorted for Trio, 2-digit for Pair)
- Wager input: USDC amount with quick-pick buttons ($1, $5, $10, $25)
- Potential payout preview: wager × multiplier (9x, 140x/280x/600x, 90x)
- **Action button flow** (per ethskills frontend-ux Rule 2):
  1. Not logged in → "Sign In to Play" → triggers Privy login
  2. Logged in, 0 USDC → "Fund Wallet to Play" → triggers `addFunds()` ← **Privy financial flow #1**
  3. Logged in, has USDC, no allowance → "Approve USDC" → ERC-20 approve tx (gas sponsored) ← **Privy financial flow #2 (sponsored tx)**
  4. Approved → "Place Bet" → `placeBet()` tx (gas sponsored) ← **Privy financial flow #3**
- Each button has its own pending/disabled state per ethskills Rule 1

**During CloseBetting phase**:
- Tabs switch to: `Close Single` | `Close Trio`
- Same UX pattern as above
- Open results displayed above for context

**During Pending/Settled**:
- Bet panel disabled, shows "Waiting for draw..." or "Round complete"

##### 2d. Wallet Panel (`components/wallet-panel.tsx`)
A sidebar or bottom drawer showing:
- **USDC balance** (formatted with `formatUnits(balance, 6)`)
- **"Add Funds" button** → Privy `useAddFunds` with destination set to user's embedded wallet on the target chain, asset = USDC ← **Core Privy qualification requirement**
- **"Transfer Out" button** → Simple modal to send USDC to an external address using Privy's `useSendTransaction` ← **Cash-out flow for Privy judges**
- Recent activity feed (your bets this session)

##### 2e. Claim Card (`components/claim-card.tsx`)
Appears when user has unclaimed winnings or refunds:
- Lists winning bets with payout amounts
- "Claim $X.XX" button → calls `claimWinnings(roundId, betIndex)` with gas sponsored
- For cancelled/partial rounds: "Claim Refund" → calls `claimRefund()`
- After claiming: celebratory animation + "Cash Out?" prompt → links to Transfer Out flow

---

#### Screen 3: History Page (`app/history/page.tsx`)

**Purpose**: View past rounds and personal bet history.

**Content**:
- Table of past rounds: Round #, Open digits, Close digits, Pair, Phase
- User's bet history: filters by connected wallet, shows bet type, pick, amount, payout, claimed status
- Expandable rows for round details
- Data fetched via contract events (`BetPlaced`, `WinningsClaimed`, `RoundSettled`) using wagmi's `useContractEvents` or a simple subgraph if available

---

### 4. Privy Integration Summary (Prize Track Qualification Checklist)

| Requirement | How We Satisfy It |
|---|---|
| **Integrate Privy as core** | Privy is THE auth + wallet layer. No MetaMask, no seed phrases. Email/Google → embedded wallet. |
| **Create/use a Privy wallet** | `embeddedWallets.createOnLogin: 'users-without-wallets'` — every user gets one automatically. |
| **One functional financial flow** | We have THREE: (1) `useAddFunds` onramp, (2) gas-sponsored `placeBet`, (3) transfer-out cash flow. |
| **Eligible flows** | Onramp (fiat → USDC via Add Funds), Transfers (cash out), Swaps/conversions (Privy handles cross-chain in the fund modal). |
| **Working demo** | Deployed Next.js app with live contract on Base. |
| **Explain how Privy improves UX** | User signs in with Google, funds with a credit card, places a bet, claims winnings, cashes out — **never sees a seed phrase, gas token, or hex address**. |

---

### 5. Gas Sponsorship Strategy

- Enable **Privy Native Gas Sponsorship** in the Privy Dashboard (Settings → Gas Sponsorship → "App pays")
- All `useSendTransaction` calls include `{ sponsor: true }`
- This means: approve tx, placeBet tx, claimWinnings tx, claimRefund tx, and transfer-out tx are ALL gasless for the user
- User only ever deals in USDC — never needs ETH for gas

---

### 6. Design System & Aesthetics

**Theme**: Dark mode primary. Rich purple/violet accent (#8B5CF6) with gold highlights (#F59E0B) for wins/payouts. Glassmorphism cards.

**Typography**: Inter (Google Fonts) for body, monospace for numbers/digits/countdowns.

**Key visual elements**:
- Animated glowing dice/number orbs for the draw reveal
- Smooth countdown timer with ticking animation
- Confetti/particle effect on successful win claim
- Gradient borders on active bet cards
- Pulsing "Add Funds" button when balance is zero
- Phase indicator with animated state transitions (dot animation moving through the pipeline)

**Responsive**: Mobile-first. Bet panel stacks vertically on mobile, side-by-side on desktop.

---

### 7. Custom Hooks

#### [NEW] `hooks/use-current-round.ts`
- `useReadContract` for `s_currentRoundId`
- `useReadContract` for `s_rounds(currentRoundId)` — returns the full `Round` struct
- Poll every ~5s during active phases, slower when settled
- Derived state: `phase`, `timeRemaining`, `openDigits`, `closeDigits`, `pairResult`

#### [NEW] `hooks/use-place-bet.ts`
- Checks USDC allowance via `useReadContract(allowance)`
- If insufficient: prompts approve tx via `useSendTransaction` with `{ sponsor: true }`
- Then calls `placeBet` via `useSendTransaction` with encoded calldata
- Manages the full 4-state flow (not connected → no funds → needs approval → ready)

#### [NEW] `hooks/use-claim.ts`
- Reads `checkPayout(roundId, betIndex)` to preview amount
- Calls `claimWinnings` or `claimRefund` via `useSendTransaction` with `{ sponsor: true }`

#### [NEW] `hooks/use-user-bets.ts`
- Fetches `BetPlaced` events filtered by the user's address
- For each bet, reads `checkPayout` to determine win/loss status
- Returns structured array for the claim card and history views

---

## Verification Plan

### Build Verification
```bash
cd frontend && npm run build
```
Must compile without errors.

### Manual Verification
1. **Auth flow**: Sign in with email → Privy creates embedded wallet → wallet address visible in nav
2. **Fund flow**: Click "Add Funds" → Privy onramp modal opens → can complete a test funding
3. **Bet flow**: Select bet type → enter pick → enter wager → Approve USDC → Place Bet (both gasless)
4. **Claim flow**: After round settles, winning bets show claim button → claim is gasless
5. **Cash-out flow**: Click "Transfer Out" → enter external address → send USDC
6. **Responsive**: Test on mobile viewport — all panels stack correctly

### Gas Sponsorship Verification
- Confirm user's ETH balance stays at 0 throughout the entire flow
- All transactions succeed without the user holding any native gas token
