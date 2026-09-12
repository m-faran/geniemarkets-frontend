# Refactor Genie Markets Frontend to Production-Grade Web3 Standard

Refactor the Genie Markets dApp frontend to production-grade Web3 standards combining the `ui-ux-pro-max` and `ethskills` design and engineering principles. The overhaul replaces hand-rolled HTML and raw custom styling with a composable shadcn/ui foundation built on `@base-ui/react`, strictly enforces an obsidian dark theme (`#0A0A0F` / `zinc-950`) with deep violet/purple accents, removes all emojis in favor of crisp `lucide-react` iconography, introduces a cohesive financial Web3 HUD, redesigns the 5-step process flow into a balanced stepper/timeline, and ensures all balances, timers, and odds use `font-mono tabular-nums`.

---

## User Review Required

> [!IMPORTANT]
> **Component Library**: We will add missing standard shadcn/ui components (`DropdownMenu`, `Separator`, `Tooltip`, `Skeleton`) built with `@base-ui/react` matching the repository's `base-vega` architecture.
> **Logo Treatment**: The header and hero brand logo will have its solid white background eliminated and will be smoothly blended into the dark obsidian header.
> **Zero-Emoji Policy**: All emojis (`🚀`, `🎲`, `💰`, `🧮`, `❓`, `✨`, `🎉`, `⏱️`) across navigation, headers, cards, and notification banners will be replaced with consistent Lucide icons and shadcn badges.

---

## Proposed Changes

### 1. Global Design System & shadcn/ui Foundation

#### [NEW] [dropdown-menu.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/ui/dropdown-menu.tsx)
- Create production shadcn `DropdownMenu` component using `@base-ui/react/menu` with dark styling, smooth animations, and item hover states.

#### [NEW] [separator.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/ui/separator.tsx)
- Create shadcn `Separator` component using `@base-ui/react/separator` with support for horizontal and vertical orientations.

#### [NEW] [tooltip.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/ui/tooltip.tsx)
- Create shadcn `Tooltip` component using `@base-ui/react/tooltip`.

#### [NEW] [skeleton.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/ui/skeleton.tsx)
- Create shadcn `Skeleton` component (`bg-zinc-800/50 animate-pulse rounded-md`) for content-shaped loading states.

#### [MODIFY] [globals.css](file:///home/faran/foundry-projects/geniemarkets-frontend/app/globals.css)
- Refine dark mode tokens: obsidian dark base (`--background: #0A0A0F` / `oklch(0.12 0 0)`), `--border: #27272A` (zinc-800), and map `--primary` and active accents to deep violet (`bg-violet-600` / `oklch(0.55 0.28 280)`).
- Ensure tactile active feedback rules (`active:scale-[0.98] transition-transform`).

#### [MODIFY] [layout.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/layout.tsx)
- Standardize metadata, typography, and obsidian dark background (`bg-[#0A0A0F] text-foreground`).

---

### 2. Global Navigation & Web3 HUD

#### [MODIFY] [nav-bar.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/nav-bar.tsx)
- **Top-Level Navigation**: Replace raw links with styled pill states / shadcn navigation controls with active indicator tabs.
- **Financial HUD**:
  - Balance: `<Badge variant="secondary" className="font-mono tabular-nums px-3 py-1 bg-zinc-900 border-zinc-800 text-zinc-100">$32.00 USDC</Badge>`.
  - Action: `<Button variant="outline" size="sm" className="gap-1.5 border-zinc-800 hover:border-violet-500/50"><PlusCircle className="h-4 w-4" /> Add Funds</Button>`.
  - Account: Wrap truncated address (`0x459E...B40B`) in a shadcn `DropdownMenu` offering:
    - Copy Address with visual feedback
    - View on Etherscan Sepolia (`https://sepolia.etherscan.io/address/...`)
    - Disconnect with red destructive hover
- **Logo Presentation**: Clean up logo rendering so it blends seamlessly with the dark header without any solid white container.

---

### 3. Restructuring Feature Grids & 5-Step Process Flow

#### [MODIFY] [how-it-works-content.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/how-it-works/how-it-works-content.tsx)
- **Zero-Emoji Purge**: Replace all quick nav chip emojis (`🚀`, `🎲`, `💰`, `🧮`, `❓`, `⏱️`) with Lucide icons paired with shadcn badge variants:
  `<Badge variant="outline" className="gap-1.5 border-violet-500/20 bg-violet-500/10 text-violet-300"><Rocket className="h-3.5 w-3.5" /> Quick Start</Badge>`
- **Fix the 5-Step Process Flow**:
  - Replace the unbalanced 3x2 grid (where step 5 spanned 2 columns) with a connected 5-step horizontal stepper on desktop that stacks sequentially on mobile with an integrated step progress bar and milestone connectors.
  - In each step card:
    - `<Card className="bg-zinc-900/60 border-zinc-800 hover:border-violet-500/40 transition-all duration-200">`
    - `<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">`: `<Badge variant="secondary" className="font-mono text-xs">01</Badge>` and corresponding Lucide icon.
    - `<CardTitle className="text-base font-semibold">`: Crisp action title.
    - `<CardContent className="text-sm text-muted-foreground space-y-3">`: Concise description and trait badge (e.g. `<Badge variant="outline" className="border-violet-500/20 bg-violet-500/10 text-violet-300">Sponsored Gas</Badge>`).
- **Interactive Calculator & Genie Math**:
  - Re-compose with shadcn `Card`, `Tabs`, `Input`, and `Button`.
  - Display real-time potential returns in `font-mono tabular-nums text-emerald-400`.

---

### 4. Interactive Controls & Form Ergonomics (BetPanel & Play Page)

#### [MODIFY] [bet-panel.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/bet-panel.tsx)
- Re-architect using shadcn `Card`, `Tabs`, `Button`, `Badge`, and `Input`.
- Market switcher: shadcn `Tabs` for Open Market vs. Close Market.
- Bet type selection: styled shadcn `Tabs` or button group.
- Market entry & prediction inputs:
  - Digits 0-9: sleek interactive shadcn `Button` grid with active violet indicator.
  - Pair & Trio: shadcn `<Input>` with validation states.
  - Wager input: shadcn `<Input>` with integrated `USDC` currency badge and right-aligned `<Button variant="ghost" size="sm">MAX</Button>` trigger.
  - Quick wager buttons (`$1`, `$5`, `$10`, `$25`) with shadcn `<Button variant="outline" size="sm">`.
- Real-time potential payout projection directly underneath inputs using `font-mono tabular-nums text-emerald-400`.
- Web3 pending states: `<Button disabled>` with `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` and explicit descriptive text ("Approving USDC...", "Awaiting VRF Randomness...", "Confirming in Wallet...").

#### [MODIFY] [round-display.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/round-display.tsx)
- Replace raw spinners with shadcn `<Skeleton className="bg-zinc-800/50" />` mirroring card geometry.
- Compose with shadcn `Card`, `Badge`, and `Button`.
- Format timers, round IDs, and odds with `font-mono tabular-nums`.

#### [MODIFY] [placed-bets.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/placed-bets.tsx)
- Re-compose with shadcn `Card`, `Badge`, and `Button`.
- Replace loading spinners with card skeletons.
- All numbers and multipliers formatted with `font-mono tabular-nums`.

#### [MODIFY] [claim-card.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/claim-card.tsx)
- Replace emojis (`🎉`) with Lucide `Trophy` / `Sparkles`.
- Re-compose using shadcn `Card`, `Badge`, `Button`.
- Formatted values in `font-mono tabular-nums`.

#### [MODIFY] [refund-card.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/refund-card.tsx)
- Replace emojis (`🎉`) with Lucide `RotateCcw` / `ShieldCheck`.
- Re-compose using shadcn `Card`, `Badge`, `Button`.
- Formatted values in `font-mono tabular-nums`.

#### [MODIFY] [wallet-panel.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/wallet-panel.tsx)
- Re-compose with shadcn `Card`, `Badge`, `Button`, `Input`.
- Format balance in `font-mono tabular-nums`.

#### [MODIFY] [app/page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/page.tsx)
- Re-compose landing page with shadcn `Card`, `Badge`, `Button`.
- Multipliers (`9x`, `90x`, `600x`) in `font-mono tabular-nums`.

#### [MODIFY] [app/history/page.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/app/history/page.tsx)
- Re-compose table and pagination using shadcn `Card`, `Badge`, `Button`, and `Skeleton` for loading table rows.
- Draw results and round IDs in `font-mono tabular-nums`.

#### [MODIFY] [emergency-recovery.tsx](file:///home/faran/foundry-projects/geniemarkets-frontend/components/emergency-recovery.tsx)
- Re-compose using shadcn `Card`, `Badge`, `Button`, `Input`.

---

## Verification Plan

### Automated Build & Typecheck
- Run `npm run build` to verify Next.js 16.3 compilation, React 19 type safety, and asset resolution with zero errors.
- Run `npm run lint` to ensure no ESLint warnings or errors.

### Visual & Functional Verification via Browser Subagent
- Launch browser subagent to:
  - Verify navigation bar with active states, HUD balance badge, Add Funds button, and Account dropdown menu.
  - Verify How It Works page: zero emojis, 5-step connected horizontal stepper / timeline, trait badges.
  - Verify Play page: shadcn BetPanel, input container with USDC badge and MAX button, potential return projection in emerald mono, and Skeleton loading states.
  - Verify responsive mobile layout at 375px without horizontal overflow.
