# Genie Markets 🧞‍♂️

## Description

Genie Markets is a decentralized, provably fair on-chain number prediction protocol built on Ethereum Sepolia. Users wager $USDC on daily digit draws resolved by **Chainlink VRF**. The protocol eliminates traditional Web3 friction via **Privy** with gas-sponsored transactions and allows users to sign in with a Google account or email, creating a seamless Web2-like experience for non-native crypto users.

> **Note:** When signing in, users have to choose either a Google account/email or an external wallet. The difference is that signing in via external wallets (e.g., MetaMask) will require users to pay their own gas fees.

After users deposit $USDC funds, they can participate in five prediction types across two daily market windows:

### 🕒 Market Windows

1. **Open Market** (18 hours)
   - Allows users to wager on **Open Single**, **Pair**, and **Open Trio**.

2. **Close Market** (6 hours)
   - Users can wager on **Close Single** and **Close Trio** during the Open market window, but the window to wager on Open Single, Open Trio, and Pair officially closes at the end of the Open market window and the start of the Close market window.

> **Why open and close market?** The open and close market allows for fun game types like the Pair.
> **Duration:** The whole market runs for 24 hours (Open 18 hours + Close 6 hours). The market windows can be adjusted according to user preference.

### 🎯 Prediction Types

1. **Single Digits (0–9)** 
   - Derived via `(digit1 + digit2 + digit3) mod 10` for a **9x payout**.
   - *Example:* `1, 2, 3` = Single `6` (since `(1+2+3) % 10 = 6`).
   - Single digits are of two types: **Open Single** and **Close Single**. Single digits are derived from Trios (`123` in the above example is a trio). 

2. **Two Digit Pairs (00–99)** 
   - Formed by combining the Open Single and Close Single outcomes for a **90x payout**.
   - *Example:* 
     - `1, 2, 3` = Open Single `6`
     - `4, 5, 6` = Close Single `5`
     - The Pair becomes `65` (Open Single `6` & Close Single `5`).

3. **Three Digit Trios (000–999)**
   - High-tier jackpot markets sorted canonically under Genie Ordering math (`1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 0`). 
   - While there are 1,000 raw permutations from `000` to `999`, enforcing canonical sorting reduces the pool to exactly **220 unique trio combinations**. These offer tiered returns across three categories:
     - **Unique Trio** (3 distinct digits, e.g., `123`): **140x**
     - **Twin Trio** (2 identical digits, e.g., `100`): **280x**
     - **Jackpot Trio** (3 identical digits, e.g., `000`): **600x**
   - *Breakdown:* There are only 10 Jackpot trios, 90 Twin Trios, and 120 Unique trios adding up to 220 unique trios.
   - Trios are of two types: **Open Trio** and **Close Trio**. The Open Single and Close Single are derived from their respective Trios. 

**Hence these are the 5 prediction types:** Open Single, Close Single, Open Trio, Close Trio, and Pair.

### 🔄 Genie Market Round Flow

1. Users wager on singles, trios, and pairs.
2. First, the **Open market** is settled by Chainlink VRF. It returns a 3-digit number (e.g., `123`)—this is the **Open Trio**. Based on this, the **Open Single** is derived (e.g., `6` in this case). In this step, the Open Single and Open Trio are settled.
3. Secondly, the **Close market** is settled as well by Chainlink VRF. It returns another 3-digit number (e.g., `456`)—this is the **Close Trio**. Based on this, the **Close Single** is derived (e.g., `5` in this case). In this step, the Close Trio and Close Single are settled, along with the **Pair** (derived from Open Single + Close Single, e.g., `65`).

**Round Settlement Example:**
- Open Trio: `123`
- Open Single: `6`
- Close Trio: `456`
- Close Single: `5`
- Pair: `65`

### 🔒 Security & Escrow

All wagers are locked in a non-custodial smart contract escrow. Payouts are pull-based and can be claimed within 30 days of round finalization. If a randomness request hangs past a 24-hour window, a permissionless emergency recovery mechanism allows any user to trigger 100% wager refunds.

## 🚀 Features

- **Five Prediction Types** across two daily market windows. Open Single, Close Single, Open Trio, Close Trio, and Pair.
- **Chainlink VRF v2.5 (Verifiable Random Function):** Every round outcome is resolved by Chainlink's decentralized oracle network. The VRF generates a cryptographic proof alongside each random number, meaning the result is verifiable on-chain and cannot be tampered with by operators, miners, or the protocol itself. Two VRF calls settle each round; one for the Open market, one for the Close market.
- **Privy Embedded Wallets & Gas Sponsorship (ERC-4337):** Users can sign in with a Google account or email; no browser extension or seed phrase required. Privy creates a smart account under the hood and sponsors all gas fees, so users never pay for transactions. External wallets (e.g., MetaMask) are also supported, but those users pay their own gas.
- **Non-Custodial Escrow:** All wagers are held in the smart contract, not by a third party. Payouts are pull-based, winners claim within 30 days.
- **Permissionless Emergency Recovery:** If a Chainlink VRF response hangs past a 24-hour window, any user can trigger a full refund of all wagers for that round.

## 💻 Tech Stack

- **Frontend Framework:** Next.js, React
- **Styling:** Tailwind CSS, shadcn/ui, luicide react
- **Blockchain:** wagmi, viem, Privy.io, Chainlink VRF, solidity (foundry) smart contracts

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (shadcn/ui, `bet-panel.tsx`, etc.).
- `/hooks`: Custom React hooks for Web3 interactions (`use-current-round`, `use-place-bet`, etc.).
- `/lib`: Utility functions and ABIs.
- `/smartcontracts-abis`: Smart contract interfaces for the protocol (e.g., `GenieMarkets.sol`).

## Getting Started

```bash
npm install
npm run dev
```

## Privy Integration

Privy is used across the codebase for authentication, embedded wallets, and gas-sponsored transactions. Key integration points:

1. [`hooks/use-user-bets.ts` — Wallet-aware bet queries](./hooks/use-user-bets.ts#L21-L32)
2. [`hooks/use-user-bets.ts` — Embedded wallet detection](./hooks/use-user-bets.ts#L134-L143)
3. [`components/bet-panel.tsx` — Auth state & login flow](./components/bet-panel.tsx#L37-L48)
4. [`components/nav-bar.tsx` — Wallet connect / disconnect UI](./components/nav-bar.tsx#L35-L49)
5. [`components/wallet-panel.tsx` — Wallet info & funding](./components/wallet-panel.tsx#L27-L41)
6. [`components/claim-card.tsx` — Auth-gated claim flow](./components/claim-card.tsx#L28-L40)
7. [`components/refund-card.tsx` — Auth-gated refund flow](./components/refund-card.tsx#L28-L40)
8. [`components/placed-bets.tsx` — User bet history](./components/placed-bets.tsx#L35-L45)
9. [`components/emergency-recovery.tsx` — Emergency refund trigger](./components/emergency-recovery.tsx#L25-L35)
10. [`components/round-display.tsx` — Round settlement display](./components/round-display.tsx#L143-L153)
11. [`components/admin/admin-content.tsx` — Admin panel auth](./components/admin/admin-content.tsx#L41-L51)
12. [`components/providers.tsx` — PrivyProvider & WagmiProvider setup](./components/providers.tsx#L14-L33)
13. [`hooks/use-smart-transaction.ts` — Smart account gas sponsorship](./hooks/use-smart-transaction.ts#L20-L55)
14. [`lib/wagmi-config.ts` — Wagmi + Privy chain config](./lib/wagmi-config.ts#L1-L11)

## ⚠️ Known Issues

- **Deposit and Deposit Funds not functional on testnet:** Privy's on-ramp solutions do not work in non-mainnet environments. The "Deposit" and "Deposit Funds" buttons are supposed to open the Privy funding flow but here nothing happens because of the limitations. To test the app, send testnet USDC directly to the embedded wallet address.

## 📜 License

All rights reserved. This code is proprietary and may not be copied, modified, or distributed without explicit permission.
