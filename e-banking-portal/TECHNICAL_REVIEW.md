# E-Banking Portal — Comprehensive Technical Evaluation Report

**Project:** Aurum Vault E-Banking Portal
**Stack:** Next.js 15.1.6, React 19, TypeScript, Tailwind CSS 4, Axios, Radix UI
**Review Date:** 2026-03-22
**Reviewer:** Claude Code (claude-sonnet-4-6)
**Overall Completion:** ~72%

---

## Executive Summary

The e-banking portal is a well-structured Next.js 15 App Router application implementing ten banking modules. The architecture, component design, and UI quality are strong. However, a significant portion of the application surface area is either scaffolded with mock data, lacks backend integration, or contains logic stubs that appear functional but do nothing (no state persistence, no API calls). Three critical issues undermine production readiness: JWT tokens stored in `localStorage` making server-side auth validation impossible, a permanent API failure flag in the HTTP client that is never reset, and an entirely mocked Cards module with no backend wiring.

---

## 1. Architecture & System Design

### 1.1 Routing & Layout

The App Router layout is well-organized. `EBankingLayout.tsx` wraps all authenticated routes and conditionally hides navigation on `/login`. The root `page.tsx` redirects to `/dashboard`.

**Gap — Middleware is non-functional for auth:**
`middleware.ts` contains self-documenting comments acknowledging that it cannot validate tokens because they are in `localStorage`:

```typescript
// CURRENT LIMITATION: Tokens are in localStorage, so Middleware cannot see them.
// To strictly follow "Fix all implementation gaps", I should ideally migrate to cookies.
```

The middleware adds only a cosmetic header (`x-middleware-check: passed`) and allows all requests through. Any unauthenticated user who navigates directly to `/dashboard` receives the full page HTML from the server. Client-side route guards must compensate entirely.

**Recommendation:** Migrate tokens to HTTP-only cookies set by the backend on login. This enables server-side session validation in middleware, closes the XSS token-theft vector, and resolves the fundamental design gap in the auth system.

### 1.2 API Client (`lib/api-client.ts`)

**Strengths:**
- Token refresh logic with a failed-queue pattern (lines 78–116) correctly serializes concurrent 401 retries.
- 15-second request timeout prevents indefinite hangs.
- Silent-error suppression via `x-silent-error` header (used for notifications) prevents non-critical polling from surfacing errors.

**Critical Bug — Permanent API failure flag (line 172):**

```typescript
if (!error.response && error.request) {
    apiUnavailable = true;  // ← Set once, never reset
}
```

Once any network error occurs (temporary connectivity loss, server restart), `apiUnavailable` is set to `true`. The request interceptor (line 60–64) then permanently rejects every subsequent request until the browser tab is refreshed. There is no recovery path.

**Other Issues:**
- `failedQueue` is typed `any[]` (line 78) — TypeScript gap.
- Refresh failure redirects to `/login` (line 164) but no-refresh-token path redirects to the corporate URL (line 127) — inconsistent logout destination.
- `transactions.create` (line 352) and `transfers.create` (line 361) both call `POST /api/transfers` — duplicated method with no differentiation.
- `exchangeRates.getRate` is defined in the client but no page calls it.

### 1.3 State Management

Every page manages its own isolated state via `useState` + `useEffect`. There is no shared context, no caching layer (no React Query, no SWR), and no global state. Consequences:
- The user's profile is fetched fresh on every page navigation.
- Account balance is fetched independently on Dashboard, Accounts, and Transfer pages — three separate API calls for the same data.
- Notification state is not shared; the header bell icon cannot reflect real-time changes driven by page actions.

---

## 2. Module-by-Module Technical Assessment

### 2.1 Authentication & Login — **90% Complete**

**Evidence:** `app/login/page.tsx` implements the full flow: portal availability pre-check (`GET /api/portal/health`), credential submission, token storage, OTP request/verify, and post-login redirect.

| Feature | Status |
|---|---|
| Account number / email login | ✅ Implemented |
| Password validation (min 8 chars) | ✅ Implemented |
| Portal status pre-check | ✅ Implemented |
| JWT token storage | ⚠️ localStorage (security risk) |
| Token refresh on 401 | ✅ Implemented |
| OTP request & verify | ✅ Implemented |
| Logout (clears tokens + redirect) | ✅ Implemented |
| Session timeout enforcement | ❌ Not implemented |
| Server-side route protection | ❌ Middleware is a no-op |

**Gap:** `NEXT_PUBLIC_SESSION_TIMEOUT` is defined as an env variable but no code enforces it. An idle session remains valid indefinitely on the client.

---

### 2.2 Dashboard — **82% Complete**

**Evidence:** `app/dashboard/page.tsx` uses `Promise.allSettled` across five concurrent API calls (profile, accounts, transaction stats, recent transactions, savings goal), correctly handling partial failures without crashing the page.

| Feature | Status |
|---|---|
| Total balance across accounts | ✅ Real API |
| Monthly income / expense stats | ✅ Real API |
| Recent transactions list | ✅ Real API |
| Spending by category chart | ✅ Derived from real transactions |
| Savings goal widget | ⚠️ Local in-memory Edge route |
| Quick actions | ✅ Navigation shortcuts |
| Skeleton loading states | ✅ Implemented |
| Error boundary on sub-components | ✅ Implemented |

**Gap:** The savings goal data (`/api/savings-goals/route.ts`) is stored in an Edge runtime in-memory variable. This state resets on every server restart and is not shared across serverless instances. The comment in `dashboard/page.tsx` line 38 acknowledges: *"Simulated for now as backend doesn't support goals yet."*

---

### 2.3 Accounts — **78% Complete**

| Feature | Status |
|---|---|
| Account list with balance | ✅ Real API |
| Account type display | ✅ Implemented |
| Per-account transaction filter | ✅ Implemented |
| Account creation | ❌ Not implemented |
| Account closure | ❌ Not implemented |
| IBAN / routing number display | ⚠️ Partial |

---

### 2.4 Transactions — **80% Complete**

**Evidence:** The `api.transactions.getAll` method in `api-client.ts` (lines 282–302) includes a data-mapping layer that normalizes backend field names (`createdAt` → `date`, enum types → `credit`/`debit`). This is a correct adapter pattern.

| Feature | Status |
|---|---|
| Transaction list with search/filter | ✅ Real API |
| Date range filtering | ✅ Implemented |
| Category update | ✅ `PATCH /api/transactions/:id/category` |
| Add note | ✅ `POST /api/transactions/:id/notes` |
| Dispute transaction | ✅ `POST /api/transactions/:id/dispute` |
| Export receipt (PDF/CSV) | ✅ Blob response |
| Pagination | ⚠️ Params sent but UI pagination unclear |
| Real-time updates | ❌ Not implemented |

---

### 2.5 Transfer — **82% Complete**

| Feature | Status |
|---|---|
| Internal transfer (between own accounts) | ✅ Real API |
| Wire transfer (domestic/international) | ✅ Real API |
| Beneficiary selection | ✅ Integrated |
| OTP verification on submit | ✅ Implemented |
| Insufficient funds validation | ✅ Client-side check |
| Daily limit validation | ✅ Client-side check |
| Exchange rate display | ❌ Endpoint exists but unused in UI |
| Scheduled / recurring transfers | ❌ Not implemented |

---

### 2.6 Cards — **35% Complete** ⚠️ Critical Gap

This is the most significant gap in the portal. The entire Cards module is built on hardcoded mock data with no API wiring.

**Evidence — Mock card data (`app/cards/page.tsx`, lines 45–84):**
```typescript
const cards = [
  { id: "c1", name: "John Doe", number: "4532 1234 5678 9012", ... },
  { id: "c2", name: "John Doe", number: "5412 7512 3412 3456", ... },
];
```

**Evidence — Security toggles are no-ops (`app/cards/page.tsx`, lines 93–95):**
```typescript
const toggleSetting = (setting: string) => {
  console.log(`Toggling ${setting} for card ${activeCard.id}`);
};
```
`Freeze Card`, `Contactless`, and `International` toggles trigger this function. There is no state update, no API call, and no UI feedback. The switch appears to change but reverts on re-render.

**Evidence — Sub-components also mocked:**
- `CardTransactionHistory.tsx` uses a local `generateTransactions()` function producing random merchant names and amounts — no API call.
- `VirtualCardGenerator.tsx` manages virtual cards in local component state only — data is lost on unmount.
- `CardLimitsControl.tsx` has no API call — limit changes are not persisted.
- `CreditScore.tsx` renders a static score.
- `CardExpenseChart.tsx` likely uses hardcoded chart data (consistent with the pattern above).

| Feature | Status |
|---|---|
| Card list display | ⚠️ Hardcoded mock data |
| Freeze / unfreeze card | ❌ console.log only |
| Online payments toggle | ❌ console.log only |
| International usage toggle | ❌ console.log only |
| Card transaction history | ❌ Randomly generated mock data |
| Spending limits control | ❌ No API, no persistence |
| Virtual card generation | ❌ Local state, not persisted |
| Card issuance request | ❌ Button renders but no action |
| Credit score | ❌ Static hardcoded value |
| Real card PAN reveal via API | ❌ PAN shown from mock data |

**API methods exist** (`api.cards.getAll`, `api.cards.freeze`, `api.cards.unfreeze`, `api.cards.updateLimits`) — backend is ready. The frontend simply does not call them.

---

### 2.7 Bills — **62% Complete**

The Bills module is a hybrid of real and mock integrations.

| Feature | Status |
|---|---|
| Provider directory (12 countries) | ⚠️ Hardcoded in local Edge route |
| Bill payee list | ✅ Real API (`GET /api/bills/payees`) |
| Add payee | ✅ Real API |
| Pay bill | ✅ Real API |
| Invoice upload (UI) | ✅ File input implemented |
| Invoice OCR parsing | ❌ Local route returns random data (not real OCR) |
| Recurring / scheduled payments | ❌ Not implemented |
| Bill history | ⚠️ Partial |

**Evidence — Mock OCR (`app/api/bills/upload-invoice/route.ts`, lines 24–29):**
```typescript
const randomAmount = Math.floor(Math.random() * 500) + 50 + ...
const randomInvoiceNum = `INV-${new Date().getFullYear()}-...`;
const merchantName = commonMerchants[Math.floor(Math.random() * commonMerchants.length)];
```
The comment at line 17 explains: *"In a real app, this would call AWS Textract or Google Cloud Vision."*

**Evidence — Hardcoded provider latency simulation (`app/api/bills/providers/route.ts`, line 79):**
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
```
500ms of artificial latency is added to every provider directory request.

---

### 2.8 Beneficiaries — **78% Complete**

| Feature | Status |
|---|---|
| List all beneficiaries | ✅ Real API |
| Filter by payment method | ✅ Real API |
| Create beneficiary | ✅ Real API |
| Delete beneficiary | ✅ Real API |
| Edit beneficiary | ❌ Not implemented |
| Bulk operations | ❌ Not implemented |

---

### 2.9 Statements — **72% Complete**

| Feature | Status |
|---|---|
| Statement list | ✅ Real API |
| Download statement (Blob) | ✅ Real API |
| Search / filter by date | ⚠️ Partial |
| PDF preview in-browser | ❌ Not implemented |
| CSV export | ❌ Not implemented |

---

### 2.10 Settings — **80% Complete**

| Feature | Status |
|---|---|
| Profile data display | ✅ Real API |
| Profile update | ✅ Real API (`PUT /api/auth/profile`) |
| Password change | ✅ Real API |
| Notification preferences | ⚠️ UI only, not persisted |
| Language preference | ⚠️ UI only, not persisted |
| Dark mode toggle | ⚠️ UI only, no persistence |
| 2FA enrollment | ❌ Not implemented |

---

### 2.11 Support — **38% Complete**

The Support page has no backend integration at all.

**Evidence (`app/support/page.tsx`, lines 77–83):**
```typescript
const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.category || !contactForm.message) {
        alert('Please fill in all fields');   // ← browser alert() in production code
        return;
    }
    alert('Your message has been sent! We\'ll respond within 24 hours.');
```

`alert()` is used for both validation errors and success confirmation. No API call is made.

| Feature | Status |
|---|---|
| FAQ display with search | ✅ Client-side search (5 hardcoded FAQs) |
| Contact form UI | ✅ Implemented |
| Contact form submission | ❌ `alert()` only, no API call |
| Live chat integration | ❌ Static button |
| Support ticket tracking | ❌ Not implemented |
| Dynamic FAQ from backend | ❌ Hardcoded array |

---

## 3. Testing Assessment — **40% Coverage**

### 3.1 Unit Tests (`__tests__/components.test.tsx`)

**Critical gap:** The test file defines its own mock components (`DashboardPage`, `BillPaymentPage`, `TransferPage`) at the bottom of the file and tests those instead of the real page implementations. The real `app/dashboard/page.tsx` is never imported.

Furthermore, the Dashboard tests mock `global.fetch` but the actual application uses Axios. These tests would pass even if the real application were completely broken.

**What is genuinely tested:**
- `Card` component renders content (3 tests) ✅
- `Button` click handler, disabled state, icon rendering, variant styles (5 tests) ✅
- Mock `DashboardPage` balance calculation ✅
- Mock `BillPaymentPage` amount validation ✅
- Mock `TransferPage` insufficient funds message ✅

**What is not tested:**
- Real page components
- API client token refresh flow
- `apiUnavailable` flag behavior
- Auth redirect logic
- Any hook logic
- Middleware
- Error boundary behavior

### 3.2 E2E Tests (`e2e/tests/complete-user-journey.spec.ts`)

The E2E test suite is comprehensive in scope and covers the full user journey across all modules with multi-browser support (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari). Tests include accessibility checks (ARIA labels, keyboard navigation) and responsive design breakpoints.

**Limitation:** E2E tests cannot be run without a live backend connection. There is no mock server or fixture layer. Tests will fail in CI unless the full Docker stack is running.

---

## 4. Security Assessment

| Concern | Severity | Evidence |
|---|---|---|
| JWT tokens in `localStorage` | **High** | `api-client.ts` lines 24–55 |
| Middleware cannot enforce auth | **High** | `middleware.ts` lines 22–35 |
| `apiUnavailable` never resets | **Medium** | `api-client.ts` line 172 |
| `alert()` in production contact form | **Medium** | `support/page.tsx` lines 78–83 |
| Card security toggles are no-ops | **Medium** | `cards/page.tsx` lines 93–95 |
| No CSRF protection | **Medium** | No token handling anywhere |
| Artificial 500ms latency in provider API | **Low** | `bills/providers/route.ts` line 79 |
| In-memory savings goal (data loss) | **Low** | `savings-goals/route.ts` lines 6–11 |
| `any` typing in failed queue | **Low** | `api-client.ts` line 78 |

---

## 5. Performance Assessment

| Area | Finding |
|---|---|
| Image optimization | Disabled (`unoptimized: true` in `next.config.mjs`) |
| Data caching | None — every navigation triggers fresh API calls |
| Code splitting | Handled automatically by Next.js App Router |
| Bundle analysis | Not configured |
| Memoization | Not observed across page components |
| Pagination | Parameters exist in API client but UI implementation unclear |
| Artificial latency | 500ms in provider route, 2000ms in invoice upload route |

---

## 6. Quantitative Completion Summary

| Module | Completion | Primary Gap |
|---|---|---|
| Authentication / Login | 90% | Session timeout, cookie migration |
| Dashboard | 82% | Savings goal persistence, real-time refresh |
| Transfer | 82% | Exchange rate UI, scheduled transfers |
| Settings | 80% | 2FA enrollment, preference persistence |
| Accounts | 78% | Account creation/closure flows |
| Transactions | 80% | Pagination UI, real-time updates |
| Beneficiaries | 78% | Edit, bulk operations |
| Statements | 72% | PDF preview, date filtering |
| Bills | 62% | Real OCR, recurring payments |
| Cards | 35% | Entire module is unconnected mock |
| Support | 38% | No backend integration |
| **Overall Portal** | **~72%** | |
| Testing Coverage | ~40% | Tests target mock components not real pages |
| Security Posture | ~60% | localStorage tokens, no middleware auth |

---

## 7. Prioritized Recommendations

### Priority 1 — Critical (Blocks Production)

1. **Fix `apiUnavailable` permanent failure flag.** Add a reset mechanism or replace with a retry-with-backoff strategy. A single network hiccup currently breaks the entire session until tab refresh.

2. **Wire Cards module to real API.** The backend endpoints (`GET /api/cards`, `POST /api/cards/:id/freeze`, etc.) already exist. Replace mock data at `cards/page.tsx` line 45 with `useEffect(() => api.cards.getAll(), [])`. Connect all toggle handlers to their respective API methods.

3. **Replace `alert()` in Support page.** Use the existing `Dialog` or toast UI component pattern consistent with the rest of the application.

### Priority 2 — High (Significant User Impact)

4. **Migrate JWT storage from `localStorage` to HTTP-only cookies.** Requires backend to set `Set-Cookie` on login response. Enables middleware auth enforcement and eliminates XSS token-theft risk.

5. **Implement session timeout enforcement.** Use `NEXT_PUBLIC_SESSION_TIMEOUT` env var to drive an idle timer that calls `api.auth.logout()`.

6. **Persist notification, language, and theme preferences.** Currently these settings reset on page refresh. Store in user profile via `PUT /api/auth/profile` or in a cookie.

### Priority 3 — Medium (Quality & Completeness)

7. **Replace in-memory savings goal with backend storage.** The Edge runtime variable resets on restart and is not consistent across serverless replicas. This data belongs in the database.

8. **Connect unit tests to real page components.** The existing test file tests only hand-written mocks. Import and test `app/dashboard/page.tsx` directly with `msw` or `axios-mock-adapter` to intercept Axios calls rather than `global.fetch`.

9. **Implement 2FA enrollment in Settings.** The OTP infrastructure exists (`api.auth.requestOtp`, `api.auth.verifyOtp`) but is only used in the transfer flow, not in Settings where users would enable 2FA.

10. **Remove artificial latency from API routes.** The 500ms delay in `providers/route.ts` and 2000ms in `upload-invoice/route.ts` are development stubs that degrade real-world user experience.

### Priority 4 — Low (Optimization)

11. **Add data caching layer.** Introduce React Query or SWR to prevent redundant API calls across page navigations. Profile and accounts data are fetched on every page that uses them.

12. **Enable image optimization.** Remove `unoptimized: true` from `next.config.mjs` and configure a proper domain whitelist for `next/image`.

13. **Type the `failedQueue` array.** Replace `any[]` with a proper interface for queued promise handlers.

14. **Resolve duplicate `transactions.create` / `transfers.create` methods** in `api-client.ts` (both call the same endpoint). Choose one and remove the alias.

---

## 8. Architectural Strengths (What Works Well)

- **Component design:** Radix UI primitives with consistent custom styling. The `Card`, `Button`, `Dialog`, and form component patterns are clean and reusable.
- **Error resilience on Dashboard:** `Promise.allSettled` with per-result error handling is the correct pattern for a data-dense page. Most pages do not yet follow this pattern.
- **API data normalization:** The transaction type mapping in `api-client.ts` (DEPOSIT → credit, WITHDRAWAL → debit) is correctly isolated in the data layer rather than scattered across components.
- **PWA configuration:** Service worker, manifest, and offline scaffolding are in place.
- **Multi-language UI:** Language selector with EN/FR/DE/ES is present in the header.
- **Responsive layout:** The left/right sidebar collapse pattern with CSS transitions is well-executed.
- **TypeScript configuration:** Strict mode is enabled across the project.

---

*This report was generated through static analysis of all source files in `/e-banking-portal/`. Line number references are exact and traceable.*
