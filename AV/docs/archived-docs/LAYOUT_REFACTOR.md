# Layout Refactor & Fixes

## Overview

The Corporate Website layout structure has been refactored to use Next.js App Router's **Global Layout** pattern effectively. This addresses issues with inconsistent styling, font loading, and layout shifts.

## Changes Implemented

### 1. Global Layout (`app/layout.tsx`)

- **Move Header/Footer**: The `<Header />` and `<Footer />` components are now rendered in `RootLayout`. This ensures they appear on *every* page automatically, preventing regressions where new pages might miss navigation.
- **Global Security Banner**: The `<SecurityNoticeBanner />` is now part of the global layout, appearing above the header consistently.
- **Font Fixes**: Removed unused `Geist` font configuration. Explicitly set `font-inter` and `antialiased` on the `<body>` tag to match `globals.css` and `tailwind.config.ts`.
- **Flex Structure**: Implemented a `flex-col min-h-screen` structure with `flex-grow` for the main content area. This ensures the Footer always sticks to the bottom even on short pages.

### 2. Page Cleanup

Removed manual imports and rendering of `<Header />`, `<Footer />`, and `<SecurityNoticeBanner />` from the following pages:

- `app/page.tsx` (Home)
- `app/(commercial)/personal-banking/page.tsx`
- `app/(commercial)/business-banking/page.tsx`
- `app/(commercial)/about/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/apply/page.tsx`
- `app/contact/page.tsx`

### 3. Benefits

- **Consistency**: All pages now share the exact same outer shell.
- **Maintainability**: Changing the layout (e.g., adding a notification bar) only requires editing `layout.tsx`.
- **Performance**: Reduced code duplication across page files.
- **Visual Stability**: Fixed potential font loading flashes and layout mismatches.

## Next Steps

- Verify `login` and `signup` pages visuals. If a dedicated "Auth Layout" (without full header) is desired in the future, a Route Group `(auth)` should be created with its own `layout.tsx`. Currently, they use the global layout as per previous implementation.
