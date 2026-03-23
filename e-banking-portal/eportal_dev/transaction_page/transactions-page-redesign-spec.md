# Transactions Page — World-Class Redesign & Feature Specification

> Internet banking web application for a premium private bank targeting high-net-worth individuals.

## 1. Redesign Vision

- Elevate the Transactions page into a **portfolio-grade activity hub** where clients can confidently audit, explore, and act on their financial history in seconds.
- Maintain the existing refined, airy visual language while introducing **institutional-level information density**, progressive disclosure, and interaction patterns that match professional trading and wealth platforms.
- Deliver an experience that feels **calm, trustworthy, and precise**: zero ambiguity around balances, statuses, and actions, with clear timelines and audit trails.
- Design for **high-volume, multi-account power users**, ensuring performance, clarity, and control even with tens of thousands of transactions.

---

## 2. Layout Reconstruction

### 2.1 Grid & Structure

- **Grid system**
  - 12‑column responsive grid (max width: 1200–1280px) centered within viewport.
  - Column gutters: 24px on desktop, 16px on tablet, 12px on mobile.
  - Page padding: 24px desktop, 16px tablet, 12px mobile.
- **Above‑the‑fold composition (desktop)**
  - Top bar (already present) remains unchanged (brand, navigation, user profile).
  - Primary content stack (within the grid):
    1. **Header row**: Page title + description on the left; primary exports/actions on the right.
    2. **Summary band**: Three (or four) KPIs (Total Transactions, Income, Expenses, Net Cash Flow) in a single row.
    3. **Controls band**: Search + filters + “Quick views” chips (e.g., Last 7 days, This month, Large transactions).
    4. **History table**: Pinned header row with scrollable body.
- **Scroll experience**
  - **Sticky Controls**: Search bar + key filter chips remain visible when scrolling the transaction table (stick to the top of the card).
  - **Scrollable Table Only**: The table body scrolls inside the card; the page background remains calm and stable.
  - **Pagination / infinite scroll**: Footer row at the bottom of the table with pagination controls and result count (e.g., “1–50 of 3,214”).

### 2.2 Key Regions

1. **Header**
   - Left: “Transactions” + concise description.
   - Right: Primary actions:
     - Export menu (CSV, PDF, Excel, QBO).
     - “Download statement” (shortcut to PDF export with date presets).
2. **KPI Summary**
   - Cards remain visually consistent with current design but are **data‑rich**:
     - Total Transactions (with delta vs last period).
     - Total Income (with arrow and percentage vs last period).
     - Total Expenses (with arrow and percentage vs last period).
     - Optional: Net Cash Flow (Income – Expenses).
3. **Filters & Search**
   - Single unified **Control Bar**:
     - Left: Search input with field selector (search in: description, merchant, category, reference).
     - Middle: Date range pill control + Quick view chips.
     - Right: Filter button (opens advanced filter panel), “Clear all” ghost button, and current active filter count.
4. **Transactions Table**
   - Table columns (desktop):
     - Indicator (icon/merchant logo).
     - Date & time.
     - Description + merchant (with secondary line).
     - Category (editable inline).
     - Account (if multi‑account).
     - Amount (right aligned).
     - Status (pill).
     - Actions (context menu).
   - **Row expansion**: click or caret to expand a transaction details drawer inline or side panel.

---

## 3. Typography System

> Note: Respect the existing font stack and aesthetic. This system organizes and standardizes usage without changing the core brand type choices already in code.

### 3.1 Font Families

- **Display / Headings**
  - `Playfair Display` (already used as `font-playfair`) for H1–H3 on marketing/summary headings.
  - Use cases: Page title “Transactions”, KPI card titles where emphasis is needed.
- **Body**
  - System sans stack (matching current Tailwind config, e.g., `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).
  - Use cases: Table text, labels, controls, helper text.
- **Monospace**
  - Existing mono stack (used for numeric values and IDs).
  - Use cases: Amount columns, confirmation IDs, export filenames.

### 3.2 Type Scale (Desktop)

- H1: 32px, Playfair, 700, line-height 1.2
- H2: 24px, Playfair or sans, 600, line-height 1.3
- H3: 20px, sans, 600, line-height 1.3
- H4: 18px, sans, 600, line-height 1.3
- Body Large: 16px, sans, 400, line-height 1.5
- Body: 14px, sans, 400, line-height 1.5
- Caption / Helper: 12px, sans, 400, line-height 1.4
- Label / Overline: 11px, sans, 600, letter-spacing +0.02em

Mobile scales down by ~2px from H2 downward while preserving line-heights and hierarchy.

---

## 4. Color System (Aligned With Existing Design)

> **Constraint**: Do NOT refactor the current color design in code. This section describes a semantic mapping and extensions that build on the existing palette to support richer functionality and accessibility.

### 4.1 Semantic Mapping (Examples)

- **Primary Brand**: existing vintage navy / gold as primary.
- **Success**: green range already used (`text-green-600`); reserve for positive balances, completed statuses, and confirmation states.
- **Warning**: warm amber/orange tone from the current palette for pending/processing.
- **Error**: red (`text-red-600` etc.) reserved for failed, disputed, or reversed transactions.
- **Info**: soft blue/gray used in backgrounds for neutral informational states.

### 4.2 Accessibility

- All text-on-surface combinations must maintain **WCAG AA** contrast (≥ 4.5:1).
- Use semantic classes (e.g., badge variants `success`, `warning`, `danger`, `neutral`) internally mapped to existing brand colors.
- Ensure focus rings and outlines have visible contrast distinct from both text and background.

---

## 5. Component Redesign Specifications

### 5.1 Header & Summary Cards

- **Current state**
  - Clean but relatively static: three cards with totals, no trends, no indication of period or comparison.
- **Upgraded design**
  - Each card includes:
    - Primary metric (e.g., `$123,456.78`).
    - Period label (“Last 30 days”) in caption text.
    - Delta indicator vs previous period (`+12.4%` with arrow).
  - Cards remain clickable to toggle **quick filters**:
    - Click “Total Expenses” → filter history to expenses for current period.
- **States**
  - Hover: subtle elevation + accent border.
  - Active: pill/underline indicating active filter + annotation in control bar (“Showing: Expenses · Last 30 days”).

### 5.2 Search & Filters

- **Current state**
  - Simple search field; basic date and category filters; no advanced logic.
- **Upgraded design**
  - **Global search**:
    - Placeholder: “Search by merchant, description, category, or amount…”
    - Field selection dropdown (optional) to restrict search to specific fields.
  - **Date range control**:
    - Presets: Today, Last 7 days, Last 30 days, This month, This year, Custom.
    - Custom range opens a compact date range picker.
  - **Advanced filters panel** (sliding panel or dropdown):
    - Transaction type (debit, credit, transfer, fee).
    - Category multi-select.
    - Amount range.
    - Status (Completed, Pending, Failed, Cancelled).
    - Search in fields.
  - **Filter summary & badges**:
    - Chips under control bar summarizing active filters (e.g., `Amount > $5,000`, `Status: Pending`).
    - X icon on each to remove.

### 5.3 Transactions Table & Row Details

- **Current state**
  - Basic table with type icon, description, editable category, date, amount, and status.
  - No details view, no bulk actions, and no visual hierarchy beyond bolding amounts.
- **Upgraded design**
  - **Row layout**:
    - Left-most: merchant/transaction icon in a subtle pill.
    - Primary line: description (merchant + descriptor).
    - Secondary line (below on wide screens or inline on narrow):
      - Category, tags, account name, or reference.
  - **Status badges** with semantic variants:
    - Completed (success).
    - Pending (warning, pulsing dot option).
    - Failed (error).
    - Disputed (accent/alert).
  - **Row expansion (details drawer)**
    - Trigger: clicking the row or a dedicated caret on the right.
    - Expanded content:
      - Full transaction metadata (ID, reference, posted/settlement dates).
      - Account from/to, running balance after transaction.
      - Notes / memo field, internal tags.
      - Quick actions: export receipt, dispute transaction, categorize, split.

### 5.4 Bulk Actions

- **Design**
  - Add leading checkbox column.
  - Above table, show bulk action bar when ≥1 row selected:
    - Re-categorize, export selected, mark as reviewed, dispute, add tag.
  - Bulk action bar fades in/out with slide animation from top of table card.

### 5.5 Empty, Loading, Error States

- **Empty state**
  - Hero icon (subtle outline), headline: “No transactions yet.”
  - Helper copy: “When your account activity starts, you’ll see deposits, transfers, and card purchases here in real time.”
  - CTA: “View account overview” or “Make a transfer”.
- **Loading state**
  - Skeleton rows for table.
  - Skeleton placeholders for KPI cards.
- **Error state**
  - Inline alert within card:
    - “We’re having trouble loading your recent activity.”
    - Actions: “Retry” and “Contact support”.

---

## 6. Content & Copy Improvements

- Page title: **Transactions**
- Subtitle: “Search, filter, and export a complete record of your account activity.”
- Search placeholder: “Search by merchant, description, category, or amount…”
- Filter panel title: “Refine results”.
- Date presets: “Today”, “Last 7 days”, “Last 30 days”, “This month”, “This year”, “Custom range”.
- Table headers:
  - Type, Description, Category, Account, Date, Amount, Status, Actions.
- Empty state copy:
  - “No transactions match your filters.”
  - Secondary: “Adjust your filters or clear them to see more activity.”

---

## 7. Imagery & Graphic Elements

- Leverage the existing **world map / network** background as brand texture.
- Use minimalistic line icons (Lucide, already in use) for:
  - Transaction types.
  - Category pictograms.
  - Status indicators.
- For potential merchant logos, reserve a small 24–32px square avatar next to the description.

---

## 8. Animation & Motion Design

- **Page load**
  - Staggered fade‑in + slight upward motion for:
    - Header (0–80ms).
    - KPI cards (80–200ms with 40ms stagger).
    - Filters (200–260ms).
    - Table rows (260–400ms in a short cascade).
- **Hover**
  - Cards: scale 1.01, shadow intensifies subtly, 120ms ease-out.
  - Buttons: background/outline transitions 120–160ms.
- **Filter panel**
  - Slide down from control bar with 200ms ease-in-out, fade from 0→100% opacity.
- **Row expansion**
  - Collapse/expand with height animation and opacity fade for inner content (200–240ms).

---

## 9. Banners & Notifications

- In‑page banners for:
  - **Sync status**: “Last updated 2 minutes ago. Refresh” (info).
  - **Data issues**: “Some transactions may be delayed while your institution is syncing.” (warning).
- Banners appear at top of the Transactions card, dismissible, with icon + concise copy.

---

## 10. User Workflow Optimization

### Primary Task: Review & export recent transactions

1. Land on page → see high-level totals and trends.
2. Use date preset (e.g., “Last 30 days”) or click a KPI card to filter.
3. Refine via search or advanced filters (e.g., category = “Travel”, amount > $500).
4. Scan table; expand rows for details when needed.
5. Select subset of rows → bulk export as CSV/PDF/Excel or mark as reviewed.

### Friction Removal & Smart Defaults

- Default date range: Last 30 days.
- Persist recent filters in local storage per user.
- When landing from a notification (e.g., “New transaction posted”), pre‑focus and highlight that transaction.

---

## 11. Accessibility Upgrades

- Ensure all interactive elements have:
  - Visible focus outlines.
  - Descriptive labels and ARIA attributes where needed (`aria-expanded`, `aria-controls` on filter panels and row expansions).
- Table:
  - Proper `<th scope="col">` for headers.
  - Row expansions announced via `aria-live` or `aria-expanded`.
- Dynamic content:
  - Loading states using `aria-busy` on the table wrapper.
  - Screen reader announcements when filters change (“Showing 50 transactions from Last 30 days”).

---

## 12. Implementation Roadmap

### Phase 1 — Quick Wins (1–3 days)

- Implement robust loading/error states for transactions fetch.
- Improve empty state copy and visual treatment.
- Add quick date presets and better search placeholder text.
- Expose CSV export in a more discoverable way and prepare export hooks for additional formats.

### Phase 2 — Core Rebuild (1–2 weeks)

- Implement the unified control bar (search + filters + quick views).
- Introduce advanced filtering (types, categories, status, amount range).
- Enhance table with:
  - Additional columns (Account, Actions).
  - Inline row expansion for details.
  - Pagination with total count.
- Add bulk selection and bulk actions.

### Phase 3 — Polish & Delight (ongoing)

- Add merchant logos / avatars where available.
- Introduce subtle motion for KPI cards, filter panels, and row expansion.
- Implement real-time updates via polling or websockets with “New transactions available” banner.
- Continuously refine analytics insights (category breakdowns, month-on-month trends).

---

## 13. Code Snippet — Upgraded Control Bar & Table Shell (React + Tailwind)

> Illustrative example using the existing React + Tailwind stack, aligned with the current Transactions page implementation. This focuses on the **control bar + table shell** with improved filters and empty/error/loading states.

```tsx
import { useState, useEffect } from "react";
import { Search, Filter, Download, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TxStatus = "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: string;
  status: TxStatus;
  date: string;
}

export function TransactionsShell() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<"30d" | "7d" | "all">("30d");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Wire to real API later
        const res = await fetch("/api/transactions?limit=50");
        if (!res.ok) throw new Error("Failed to load transactions");
        const data = await res.json();
        if (!ignore) {
          setTransactions(data.transactions || []);
        }
      } catch (err: any) {
        if (!ignore) setError(err.message || "Unable to load activity.");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      !search ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      String(tx.amount).includes(search);
    // Date preset filtering is elided here; connect to postedAt when wired.
    return matchesSearch;
  });

  return (
    <Card className="mt-6">
      <CardHeader className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle>History</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="small" onClick={() => {}}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by merchant, description, or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-between md:justify-end">
            <div className="inline-flex rounded-full border bg-background px-1 py-0.5 text-xs">
              {[
                { id: "30d", label: "Last 30 days" },
                { id: "7d", label: "Last 7 days" },
                { id: "all", label: "All time" },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id as any)}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    datePreset === preset.id
                      ? "bg-charcoal text-white"
                      : "text-muted-foreground hover:bg-slate-100/80"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant={showFilters ? "primary" : "outline"}
              size="small"
              className="h-9"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Simple “Active filters” badges (to be wired later) */}
        <div className="flex flex-wrap gap-2">
          {/* Example active filter chips */}
          {/* <Badge variant="outline" className="text-xs">
            Status: Completed
          </Badge> */}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            <AlertCircle className="w-4 h-4" />
            <span className="flex-1">
              We’re having trouble loading your recent activity.
            </span>
            <Button
              variant="ghost"
              size="small"
              className="text-red-700 hover:text-red-800"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Loading recent transactions…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No transactions match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx) => (
                  <TableRow key={tx.id} className="cursor-pointer">
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell className="text-right font-mono">
                      {tx.amount >= 0 ? "+" : "-"}
                      {Math.abs(tx.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          tx.status === "COMPLETED"
                            ? "success"
                            : tx.status === "PENDING"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

This snippet can be integrated into the existing `/app/transactions/page.tsx` as a foundation for the upgraded control bar, table behavior, and state handling, while preserving the current visual language and color system. 

