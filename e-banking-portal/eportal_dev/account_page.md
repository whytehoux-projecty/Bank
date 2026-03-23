# My Account Page Upgrade Specification

## 1. Redesign Vision
To transform the existing basic account listing into a world-class, production-ready financial dashboard that serves as the central hub for user's financial life. The design emphasizes clarity, trust, and actionable insights, suitable for a premium private banking experience.

## 2. Layout Reconstruction
- **Header Section**: 
  - Page Title with subtle subtitle.
  - Primary Actions: "Export", "Link Account", "Open New" (prominent).
- **Tabs Navigation**:
  - "Overview": The main dashboard view.
  - "Analytics": Visual breakdown of spending and income.
- **KPI Dashboard (Top)**:
  - **Total Liquid Assets**: Large, prominent display of total balance across all accounts, with monthly trend indicator.
  - **Credit Utilization**: Visual progress bar showing credit health.
- **Filter & Sort Toolbar**:
  - Quick filters for account types (All, Checking, Savings, Credit).
  - Search bar for quick lookup.
  - Sort dropdown for ordering by balance or name.
- **Account Grid**:
  - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop).
  - Individual Account Cards with hover effects.

## 3. Typography System
- **Headings**: `Playfair Display` for a classic, trustworthy feel (e.g., Page Titles, Modal Headers).
- **Body Text**: `Inter` or system sans-serif for legibility and modern utility.
- **Monospace**: `JetBrains Mono` or similar for numerical data (balances, account numbers) to ensure alignment.

## 4. Color System (Heritage Theme)
- **Primary**: Heritage Navy (`#1a2c42`) - Used for primary buttons, active states, and headers.
- **Secondary**: Vintage Gold (`#c5a059`) - Used for accents, highlights, and premium indicators.
- **Backgrounds**: 
  - Page: Soft Gray/White.
  - Cards: White with subtle shadows.
  - Featured Cards: Gradient Navy/Green.
- **Status Colors**:
  - Success/Positive: Emerald Green.
  - Warning/Negative: Burnt Orange / Red.

## 5. Component Redesign Specifications

### Account Card
- **Header**: Icon (type-specific), Account Name, Context Menu.
- **Body**: Masked Account Number, Balance (Large), Currency.
- **Footer**: Monthly change indicator (Trending Up/Down).
- **Interaction**: Click to open detailed modal.

### KPI Cards
- **Total Balance**: 
  - Background: Gradient Green/Navy.
  - Content: Total sum of positive balances.
  - Visual: Large typography, background watermark icon.
- **Credit Utilization**:
  - Visual: Progress bar with color-coded health status (Green < 30%, Amber > 30%).

### Dialogs (Modals)
- **Account Details**: 
  - Tabs for Details, Transactions, Settings.
  - Full transaction history list.
  - Quick actions (Freeze, Transfer).
- **Open New Account**:
  - Multi-step wizard (Select Type -> Review Terms -> Confirm).
- **Link External Account**:
  - Bank selection grid -> Login form -> Success.

## 6. Implementation Roadmap

### Phase 1: Foundation & Structure (Completed)
- [x] Refactor `page.tsx` to use Grid layout.
- [x] Implement `useMemo` for client-side filtering and sorting.
- [x] Create KPI calculations for Total Balance and Credit Utilization.
- [x] Add Loading Skeletons and Error States.
- [x] Integrate `Select` and `Button` components from design system.

### Phase 2: Interactive Elements (Completed)
- [x] Build `AccountDetailsDialog` for deep-dive view.
- [x] Implement Transaction History fetching within the modal.
- [x] Add "Open New Account" multi-step wizard.
- [x] Add "Link External Account" flow.

### Phase 3: Analytics & Advanced Features (Completed)
- [x] Create `AccountAnalytics` component with Charts (Pie/Bar).
- [x] Integrate Recharts for data visualization.
- [x] Add "Analytics" tab to the main view.

## 7. Code Snippets

### Core Page Logic (Filter/Sort)
```typescript
const filteredAccounts = useMemo(() => {
  return accounts
    .filter((acc) => {
      if (filterType !== "all" && acc.type !== filterType) return false;
      if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "balance-desc": return b.balance - a.balance;
        // ... other cases
      }
    });
}, [accounts, filterType, sortOrder, searchQuery]);
```

### KPI Calculation
```typescript
const totalCreditUtilization = useMemo(() => {
  const creditAccounts = accounts.filter(acc => acc.type === "credit");
  const totalLimit = creditAccounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const totalUsed = creditAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
  return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
}, [accounts]);
```
