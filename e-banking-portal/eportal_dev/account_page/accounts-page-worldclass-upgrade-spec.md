# My Accounts — World‑Class Upgrade Specification

Application context: Internet banking web application for a premium private bank targeting high‑net‑worth individuals.

Source inputs:
- Screenshot: `/eportal_dev/account_page/myaccount.png`
- Prior review: [`accounts-page-optimization-plan.md`](./accounts-page-optimization-plan.md)

---

## Redesign Vision
Deliver a refined, trust‑forward accounts hub that feels calm, precise, and immediate. The page should communicate financial clarity at a glance, with enterprise‑grade reliability and subtle motion. It prioritizes speed to insight (balances, activity, actions) while maintaining the bank’s premium brand character, minimizing cognitive load, and ensuring flawless accessibility and internationalization.

---

## Layout Reconstruction
- Structure: 12‑column responsive grid; max content width 1280px; gutters: 24px (desktop), 16px (tablet), 12px (mobile).
- Spacing scale: 4px base – 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
- Above‑the‑fold:
  - Left: Page title + subtitle + utility actions (Refresh, Open account).
  - Right: KPIs strip (Total Liquid Assets, Active Accounts, Pending Actions).
  - Below: Filters/sort controls with compact density.
  - Primary body: Accounts grid (auto‑fill, min 380px cards).
- Scroll experience:
  - Sticky compact header (title, quick filters, actions).
  - Infinite or paginated account list (configurable).

Named CSS Grid areas for <lg breakpoints:
```
"header  header"
"kpis    kpis"
"filters filters"
"grid    grid"
```
On ≥lg, KPIs align right of header.

---

## Typography System
- Display: Playfair Display (serif) – headings that carry brand gravitas.
- Body: Inter – system‑legible, performant for dense financial UIs.
- Monospace: JetBrains Mono – account numbers, amounts, IDs.
- Type scale (desktop):
  - H1: 32/40, 700 Playfair
  - H2: 24/32, 700 Playfair
  - H3: 20/28, 600 Inter
  - H4: 18/26, 600 Inter
  - Body: 14/22, 400 Inter
  - Caption: 12/18, 500 Inter
  - Label: 11/16, 600 Inter (all‑caps optional, ls 0.5px)

---

## Color System
Note: Maintain the existing brand aesthetic and usage. The palette below formalizes what is already present (navy primary + gold accent), ensuring WCAG AA contrast.

- Primary Navy (50→900): `#F2F5FA`, `#E6ECF5`, `#CCD8EB`, `#A3BAD8`, `#7F9EC6`, `#2C3E5C`, `#223249`, `#1A2639`, `#121B29`, `#0D1420`
- Accent Gold (50→900): `#FFF7EC`, `#FFEBD2`, `#FFE0BA`, `#FFD79F`, `#F9CB8A`, `#D4A574`, `#B78D61`, `#94714C`, `#73573A`, `#5A452E`
- Success: base `#16A34A`, light `#DCFCE7`, dark `#166534`
- Warning: base `#F59E0B`, light `#FEF3C7`, dark `#92400E`
- Error: base `#DC2626`, light `#FEE2E2`, dark `#7F1D1D`
- Info: base `#2563EB`, light `#DBEAFE`, dark `#1D4ED8`
- Neutrals (50→950): `#FAFAFA`, `#F5F6F7`, `#F3F4F6`, `#E5E7EB`, `#D1D5DB`, `#9CA3AF`, `#6B7280`, `#4B5563`, `#374151`, `#111827`
- Surfaces: background `#F5F6F7`, card `#FFFFFF`, overlay `rgba(18, 27, 41, 0.56)`, border `#E5E7EB`

All body text on card surfaces ≥ 4.5:1 contrast; CTA text on navy surfaces uses white for ≥ 7:1 contrast.

---

## Component Redesign Specifications
For each component: current state → upgrade, interactions, and states. Visual style keeps current brand; changes focus on structure, affordance, and micro‑interactions.

1) Page Header
- Current: Title + subtitle; no workflow affordances.
- Upgrade: Title (H1), subtitle; actions group: Refresh, Open New Account; compact density on scroll (shrinks to 48px).
- States: hover (bg subtle), focus (2px focus ring AA), active (pressed), disabled (opacity 60%).
- Micro‑interaction: fade/slide 120ms on sticky transition, ease‑out.

2) KPI Strip (Total Liquid Assets, Active Accounts)
- Current: single banner; data often $0 with errors.
- Upgrade: KPI cards with skeletons; currency formatted; tooltip with definition; click drills down to filtered Accounts.
- States: loading skeleton, error badge, interactive hover reveal of drilldown.

3) Filters & Sorting
- Current: absent.
- Upgrade: Pills for type (All/Checking/Savings/Credit/Investment), Sort select (Balance, Name, Recent), search input for nickname/last4. Persist to localStorage.
- States: selected pill, hover, focus, clear‑all.

4) Accounts Grid
- Current: empty.
- Upgrade: Auto‑fill responsive grid; skeleton cards while loading; empty state with primary CTA.
- States: loading (shimmer), empty, populated.

5) Account Card
- Current: not present.
- Upgrade: Header (type icon + nickname + last4) + balance section + status/interest + footer quick actions + recent activity preview. Quick actions menu anchored to header kebab.
- States: default, hover elevation, focus (outline), active, disabled, loading; error badge if partial data.
- Micro‑interactions: menu open/close 160ms fade/scale; progress bar animates width 240ms.

6) Error Banner
- Current: “3 errors” indicator; no context.
- Upgrade: Inline dismissible banner with retry; logs to Sentry console link (dev only).
- States: error, warning, info, success variants.

7) Account Details Modal
- Current: none.
- Upgrade: Accessible modal with tabs (Overview, Activity, Statements, Settings); close on ESC; focus trapped; restores focus.

8) Notification/Promo Banners
- Optional promo band (e.g., “Upgrade to Private Concierge”); respects priority and dismiss persistence.

---

## Content & Copy Improvements
- Title: “My Accounts”
- Subtitle: “View balances, activity, and manage every account from one place.”
- KPI labels: “Total liquid assets”, “Active accounts”
- Filters: “All”, “Checking”, “Savings”, “Credit”, “Investment”; Sort: “Balance (High → Low)”, “Balance (Low → High)”, “Name (A → Z)”, “Recent activity”
- Empty state: “No accounts yet. Open your first account to get started.”
- Tooltips: Define “Liquid assets”; “Available vs current balance”

---

## Imagery & Graphic Elements
- Retain current world‑map background and navy hero aesthetic.
- Icon library: Lucide (outlined), 16–20px default, 1.5px stroke; consistent color per state.
- No additional textures; subtle shadow elevation for cards only.

---

## Animation & Motion Design
- Page load: header, KPIs, filters, then grid (40ms stagger, 120–180ms durations, ease‑out).
- Hover: 4dp elevation, translateY(‑2px), 120ms.
- State transitions: skeleton → content cross‑fade 160ms; banners slide‑down 160ms.
- Modal: scale 0.98→1.0 and backdrop fade 160ms; ESC close 80ms.

---

## Banner & Promotional Elements
- In‑app notifications: info (blue), warning (amber), error (red), success (green). Dismiss stores a 7‑day TTL in localStorage.
- Promo: place below header; single line with CTA aligned right; hidden when any error banner is visible.

---

## User Workflow Optimization
- Primary flows:
  1) Scan KPIs → click to filtered view
  2) Find an account → act (Transfer/Pay/Statements/View)
  3) Open new account
- Friction removal: persistent filters; quick actions in card header; recent activity preview within card; direct drill‑downs.
- Progressive disclosure: summary in card → detailed modal when needed.

---

## Accessibility Upgrades
- ARIA: descriptive labels for KPI buttons, card actions, menu and modal.
- Focus order: header → KPIs → filters → grid (row major) → modal controls on open.
- Screen reader: live region updates on data refresh (e.g., “Loaded 12 accounts, 9 active.”).
- Color blindness: primary/semantic colors verified against deuteranopia; rely on shape + text labels for status.

---

## Implementation Roadmap
Phase 1 — Quick Wins (1–3 days)
- Robust data loading with retry and error banner.
- KPI strip with skeletons and accurate liquid asset calc.
- Filters (type pills) + sort select (persisted).
- Accounts grid with skeleton and empty state.

Phase 2 — Core Rebuild (1–2 weeks)
- AccountCard component + QuickActions menu.
- AccountDetails modal with Overview and Activity.
- Recent activity preview and credit utilization.
- Localized copy and currency.

Phase 3 — Polish & Delight (ongoing)
- Motion tuning; promo/notification variants.
- Statements integration; account settings; external accounts linking.
- Performance audits (LCP ≤ 2.5s, TTI ≤ 3s on mid‑tier devices).

---

## Code Snippet — Layout + KPI + Account Card (React + Tailwind)
This example demonstrates the new layout structure, KPI strip, and an upgraded AccountCard while preserving brand colors (using utilities consistent with the current palette).

```tsx
import { useEffect, useState } from "react";
import { Eye, CreditCard, Building, MoreHorizontal, RefreshCcw, Plus } from "lucide-react";

type Account = {
  id: string;
  type: "checking" | "savings" | "credit" | "investment";
  name: string;
  nickname?: string;
  accountNumber: string;
  availableBalance: number;
  currentBalance?: number;
  creditLimit?: number;
  interestRate?: number;
  status?: "active" | "frozen" | "closed";
  recentTransactions?: { merchant: string; amount: number; type: "credit" | "debit" }[];
};

function Kpi({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-bold text-[#2C3E5C] font-serif">{value}</div>
    </button>
  );
}

function AccountCard({ account }: { account: Account }) {
  const last4 = account.accountNumber.slice(-4);
  const isCredit = account.type === "credit";
  const pct =
    isCredit && account.creditLimit
      ? Math.min(100, Math.round(((account.currentBalance || 0) / account.creditLimit) * 100))
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Building className="h-5 w-5 text-[#2C3E5C]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-slate-800">{account.nickname || account.name}</div>
          <div className="text-xs text-slate-500">•••• {last4}</div>
        </div>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isCredit ? "Available Credit" : "Available Balance"}
        </div>
        <div className="mt-1 text-3xl font-serif font-bold text-[#2C3E5C]">
          ${account.availableBalance.toFixed(2)}
        </div>
        {account.currentBalance !== account.availableBalance && (
          <div className="mt-1 text-xs text-slate-400">Current: ${Number(account.currentBalance || 0).toFixed(2)}</div>
        )}
        {isCredit && account.creditLimit && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>Credit Used</span>
              <span className="font-semibold text-slate-800">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div
                className={`h-full rounded ${pct > 30 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${pct}%`, transition: "width 240ms ease" }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>${Number(account.currentBalance || 0).toFixed(2)} used</span>
              <span>${Number(account.creditLimit || 0).toFixed(2)} limit</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 border-t border-slate-100 bg-slate-50 p-4">
        <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-[#D4A574] hover:bg-[#FFFBF5]">
          <Eye className="h-4 w-4" />
          View
        </button>
        {account.type !== "credit" ? (
          <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-[#D4A574] hover:bg-[#FFFBF5]">
            <CreditCard className="h-4 w-4" />
            Transfer
          </button>
        ) : (
          <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-[#D4A574] hover:bg-[#FFFBF5]">
            <CreditCard className="h-4 w-4" />
            Pay
          </button>
        )}
      </div>
    </div>
  );
}

export default function AccountsDemo() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalLiquid, setTotalLiquid] = useState(0);

  useEffect(() => {
    const demo: Account[] = [
      { id: "1", type: "checking", name: "Private Checking", accountNumber: "1234567890", availableBalance: 152340.12, currentBalance: 152340.12, status: "active" },
      { id: "2", type: "credit", name: "Visa Infinite", accountNumber: "4444333322221111", availableBalance: 23000, currentBalance: 5500, creditLimit: 30000, status: "active" }
    ];
    setTimeout(() => {
      setAccounts(demo);
      setTotalLiquid(demo.filter(a => a.type !== "credit").reduce((s, a) => s + a.availableBalance, 0));
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-800">My Accounts</h1>
          <p className="text-sm text-slate-600">View balances, activity, and manage every account from one place.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg bg-[#2C3E5C] px-3 py-2 text-xs font-semibold text-white hover:brightness-110">
            <Plus className="h-4 w-4" />
            Open Account
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Kpi label="Total liquid assets" value={loading ? "…" : `$${totalLiquid.toFixed(2)}`} />
        <Kpi label="Active accounts" value={loading ? "…" : String(accounts.filter(a => a.status === "active").length)} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />)
          : accounts.map(a => <AccountCard key={a.id} account={a} />)}
      </div>
    </div>
  );
}
```

--- 

This specification keeps the current visual identity intact while elevating information density, interactivity, accessibility, and reliability. It integrates the earlier optimization plan and expands it into a production‑ready design brief and implementation outline. 
