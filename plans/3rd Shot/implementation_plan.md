# Implementation Plan: 'How It Works' Game Guide & Tutorial Page

Create a dedicated, interactive **How It Works** tutorial page (`/how-it-works`) that clearly explains the Genie Markets prediction protocol, game types, payout multipliers, the unique Genie-sort digit ordering, round lifecycle, and claiming rules, complete with interactive calculators and visual guides.

---

## User Review Required

> [!IMPORTANT]
> **Genie-Sort Ordering Rule Highlighted**:
> In Genie Markets smart contracts ([GenieMath.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMath.sol)), digit rank is strictly `1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0` where `0` is the highest digit (rank 10). The tutorial page will prominently explain this rule and provide an interactive **Genie-Sort Demo & Validator** so players never make invalid picks.

> [!NOTE]
> **Navigation Bar Updates**:
> We will add "How It Works" to the main [NavBar](file:///home/faran/foundry-projects/geniemarkets-frontend/components/nav-bar.tsx) alongside `Play` and `History`, and ensure active page highlighting works seamlessly.

---

## Open Questions

None currently blocking. The smart contract rules, payouts, and math are fully verified directly against [GenieMarkets.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMarkets.sol) and [GenieMath.sol](file:///home/faran/foundry-projects/geniemarkets-frontend/GenieMath.sol).

---

## Proposed Changes

### 1. Navigation & Discoverability

#### [MODIFY] [nav-bar.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/nav-bar.tsx)
- Add a new navigation link to `/how-it-works` using Lucide's `HelpCircle` / `BookOpen` icon.
- Integrate active route detection (via `usePathname()`) so the current page is visually highlighted (`bg-white/10 text-white` vs `text-zinc-400 hover:text-white`).
- Fix minor warning on logo image dimensions (`width="auto"`/`height="auto"` or CSS aspect ratio).

#### [MODIFY] [page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/page.tsx)
- Add a secondary CTA in the Hero section ("Learn How It Works" / "View Game Guide") pointing to `/how-it-works`.
- Link the footer to `/how-it-works`.

---

### 2. Interactive Tutorial Components

#### [NEW] [how-it-works-content.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/how-it-works/how-it-works-content.tsx)
Client component containing the complete interactive educational experience:
1. **Quick-Start 5-Step Visual Walkthrough**:
   - Step 1: Sign in & Instant Wallet (Privy Google/email, 0 gas fees).
   - Step 2: Understand Round Windows (Open Market 21h, Close Market 24h).
   - Step 3: Pick Numbers & Bet (Single, Pair, Trio).
   - Step 4: Provably Fair Draws (Chainlink VRF random generation).
   - Step 5: Claim Your USDC (30-day claim window).
2. **Game Types & Returns Breakdown Matrix**:
   - **Single (Open & Close)**: 0-9 pick, `(d1+d2+d3)%10` derived result, 10% probability, **9x** return.
   - **Pair**: 00-99 pick, `openSingle * 10 + closeSingle` derived result, 1% probability, **90x** return.
   - **Trio (Open & Close)**: 3-digit Genie-sorted pick:
     - **Unique Trio** (3 distinct digits): 120 combinations, **140x** return.
     - **Twin Trio** (pair of identical digits): 90 combinations, **280x** return.
     - **Jackpot Trio** (all 3 identical digits): 10 combinations, **600x** return.
3. **Interactive Genie-Sort Explorer & Validator**:
   - Users can type any 3 digits or click "Roll Random Draw".
   - Shows live sorting based on Genie rank (`0` is highest!).
   - Automatically determines Trio Type (Unique, Twin, or Jackpot) and derived Single digit.
   - Demonstrates valid vs invalid picks with clear feedback.
4. **Interactive Payout & Profit Calculator**:
   - Select Bet Type (Single, Pair, Unique Trio, Twin Trio, Jackpot Trio).
   - Slider or quick chips for Wager Amount ($1, $5, $10, $25, $50, $100).
   - Live displays:
     - Multiplier
     - Potential Total Payout ($ USDC)
     - Net Profit ($ USDC)
     - Win condition description
5. **Round Lifecycle & Timeline**:
   - Visual timeline mapping the 5 stages: `OpenBetting` → `OpenPending (VRF)` → `CloseBetting` → `ClosePending (VRF)` → `Settled & Claims`.
   - Explains that Close bets can be placed even while Open betting is active.
6. **Frequently Asked Questions (FAQ)**:
   - Accordion answering common questions (VRF verification, sponsored gas, 30-day claim period, emergency staleness handling).

---

### 3. Page Route

#### [NEW] [page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/how-it-works/page.tsx)
- Server component exporting SEO metadata (`title: "How It Works — Genie Markets"`, `description: "Complete tutorial on game types, payout multipliers, Genie math, and round rules."`).
- Renders `<HowItWorksContent />`.

---

## Verification Plan

### Automated Tests & Quality Checks
- Run `npm run lint` to verify zero ESLint warnings/errors.
- Run `npx tsc --noEmit` to verify complete TypeScript type safety across all new components and pages.

### Manual / Browser Verification
- Start local Next.js dev server (`npm run dev`).
- Navigate to `/how-it-works` via the new navigation bar link.
- Verify the active route tab highlights on `/how-it-works`, `/play`, and `/history`.
- Test the **Interactive Payout Calculator**:
  - Test $10 wager on Single -> verifies $90 payout (9x).
  - Test $10 wager on Pair -> verifies $900 payout (90x).
  - Test $10 wager on Jackpot Trio -> verifies $6,000 payout (600x).
- Test the **Genie-Sort Explorer Widget**:
  - Enter `012` -> demonstrates it auto-sorts to `120` because `0` has highest rank.
  - Enter `777` -> classifies as Jackpot Trio (600x).
  - Enter `353` -> sorts to `335`, classifies as Twin Trio (280x).
  - Verify derived single calculations `(d1+d2+d3)%10`.
- Verify responsive mobile and desktop layout aesthetics and dark theme consistency.
