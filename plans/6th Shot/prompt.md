using the ui-ux-pro skill and the ux skills in ethskills as a combo fix the current state of the frontend...
here is the exact requirement...
```
/ui-ux-pro-max Refactor the entire Genie Markets dApp frontend to a production-grade Web3 standard leveraging our existing shadcn/ui component library. Strictly maintain our obsidian dark theme and purple/violet accent palette across all pages, layouts, and components.

### Global Design System & shadcn/ui Foundation
- **Component-First (Zero Reinvention):** Do NOT hand-roll raw `<button>`, `<div className="card...">`, custom tab bars, or custom modals. Strictly compose from existing `@/components/ui/*` primitives (`Card`, `Badge`, `Button`, `Tabs`, `Separator`, `Tooltip`, `Skeleton`, `DropdownMenu`, `Dialog`, `Input`).
- **Semantic Color Tokens:** Use shadcn CSS tokens and dark Tailwind classes:
  - Base: `bg-background` (`#0A0A0F` / `zinc-950`), `border-border` (`border-zinc-800`), `text-foreground` (`text-zinc-100`), `text-muted-foreground` (`text-zinc-400`).
  - Accents: Map `primary` and key highlights to deep violet/purple (`bg-violet-600`, `text-violet-400`, `border-violet-500/30`). Do not introduce neon cyan, bright pink, or random gradients.
- **Typography & Numerics:** 
  - Standardize display typography with modern sans-serif fonts using tight tracking (`tracking-tight font-bold`). Remove all serif display fonts.
  - All token balances (`$32.00 USDC`), multipliers (`600x`), odds, round timers, and addresses MUST use `font-mono tabular-nums`.

---

### Sitewide Architectural & Component Polish

1. **Strict Iconography & Assets (Zero-Emoji Policy):**
   - Completely purge emojis (`🚀`, `🎲`, `💰`, `🧮`, `❓`, `✨`) from all buttons, tabs, headers, and badges.
   - Use official `lucide-react` icons sized consistently (`w-4 h-4` or `w-5 h-5`) paired with shadcn badge variants: `<Badge variant="outline" className="gap-1.5 border-violet-500/20 bg-violet-500/10 text-violet-300"><Rocket className="h-3.5 w-3.5" /> Quick Start</Badge>`.
   - Remove solid white square backgrounds behind the logo; blend the brand asset smoothly into the header.

2. **Global Navigation & Web3 HUD:**
   - Standardize top-level routing (`How It Works`, `Play`, `History`) using shadcn `NavigationMenu` or styled `Tabs` with subtle active pill states.
   - Format the header controls into a cohesive financial bar:
     - Balance: `<Badge variant="secondary" className="font-mono tabular-nums px-3 py-1 bg-zinc-900 border-zinc-800">$32.00 USDC</Badge>`
     - Action: `<Button variant="outline" size="sm" className="gap-1.5 border-zinc-800 hover:border-violet-500/50"><PlusCircle className="h-4 w-4" /> Add Funds</Button>`
     - Account: Wrap the truncated address (`0x459E...B40B`) in a shadcn `DropdownMenu` with options for copy address, explorer link, and disconnect.

3. **Restructuring Feature Grids & Flows:**
   - **Fix the 5-Step Process Flow:** Replace the unbalanced 3x2 card grid with one of the following:
     - A connected horizontal stepper (desktop) that stacks sequentially on mobile with an integrated step progress indicator.
     - A clean 2-column or 5-stage timeline using `<Card className="bg-zinc-900/60 border-zinc-800 hover:border-violet-500/40 transition-all duration-200">`.
   - Inside each card, use standard shadcn sections:
     - `<CardHeader>`: Number badge (`<Badge variant="secondary">01</Badge>`) and Lucide icon in top row.
     - `<CardTitle className="text-base font-semibold">`: Crisp action title.
     - `<CardContent className="text-sm text-muted-foreground">`: Concise 1-2 sentence description, supplemented by trait badges (e.g., `<Badge variant="outline">Sponsored Gas</Badge>`).

4. **Interactive Controls & Form Ergonomics:**
   - Market entry & prediction inputs: Use shadcn `<Input>` wrapped in a container with integrated currency badges and a right-aligned `<Button variant="ghost" size="sm">MAX</Button>` trigger.
   - Payout updates: Display real-time potential return projections directly underneath input fields using `font-mono tabular-nums text-emerald-400`.
   - Micro-interactions: Ensure every shadcn button and card retains tactile feedback (`active:scale-[0.98] transition-transform`).

5. **Loading & Empty State Handling:**
   - Replace raw spinners with shadcn `<Skeleton className="bg-zinc-800/50" />` that matches the exact shape of incoming cards and stat boxes.
   - Web3 pending states: Combine `<Button disabled>` with `<Loader2 className="mr-2 h-4 w-4 animate-spin" />` and explicit status text ("Awaiting VRF Randomness...", "Confirming in Wallet...").

---

### Verification Checklist
- [ ] No unstyled HTML primitives (`<button>`, `<input>`) where a shadcn component exists.
- [ ] Zero emojis across navigation, badges, tabs, and content cards.
- [ ] All dynamic numbers, balances, and hash values use `font-mono tabular-nums`.
- [ ] Contrast ratios meet WCAG AA standards against dark surfaces.
- [ ] Mobile responsive without horizontal viewport overflow.
```