# UHI Staff Portal - Implementation Plan

Based on the strategic foundation in `plan`, this document outlines the technical implementation steps for the UHI Staff Portal.

## 1. Technology Stack

* **Framework:** Next.js (App Router) - For server-side rendering, routing, and API capabilities.
* **Language:** TypeScript - For type safety and maintainability.
* **Styling:** Vanilla CSS (CSS Modules) - Utilizing modern CSS features (Variables, Flexbox, Grid) for a premium, custom look without external framework dependencies (unless requested).
* **Database:** PostgreSQL (via Prisma ORM) - Robust relational data handling.
* **Authentication:** NextAuth.js (Auth.js) - flexible auth for SSO and MFA.
* **PWA/Offline:** `next-pwa` or custom Service Worker implementation for offline caching and sync.
* **State Management:** React Context + Hooks (or TanStack Query for server state).

## 2. Directory Structure (Proposed)

```
/NEW
  /src
    /app            # Next.js App Router pages
    /components     # Reusable UI components
      /ui           # Base atoms (Button, Card, Input)
      /features     # complex feature-specific components
    /lib            # Utility functions
    /hooks          # Custom React hooks
    /styles         # Global styles and variables
    /types          # TypeScript interfaces
  /public           # Static assets
  /prisma           # Database schema
```

## 3. Phased Implementation Roadmap

### Phase 1: Foundation & Design System (Weeks 1-2)

*Objective: Establish the codebase, configure PWA, and create the visual language.*

1. **Project Initialization**:
    * Setup Next.js with TypeScript.
    * Configure ESLint and Prettier.
    * Initialize Git repository.
2. **PWA Configuration**:
    * Create `manifest.json`.
    * Setup `next-pwa` for basic caching strategies.
3. **Design System Architecture**:
    * Define CSS Variables for the "Premium" aesthetic (Colors, Typography, Shadows, Radius).
    * Implement a Robust Theme Provider (Dark/Light mode ready).
    * **Aesthetic Focus**: Glassmorphism effects, heavy use of whitespace, refined typography (Inter/Outfit).
4. **Core Layout Implementation**:
    * Responsive Shell: Sidebar (Desktop) / Bottom Nav (Mobile).
    * Header with User Profile & Notifications.

### Phase 2: Core Infrastructure (Weeks 3-4)

*Objective: User Management and Basic Navigation.*

1. **Authentication System**:
    * Setup NextAuth.js.
    * Create Login/Register pages.
    * Implement Role-Based Access Control (RBAC) hooks.
2. **Dashboard Shell**:
    * Create the personalized homepage layout.
    * Implement a widget grid system (drag-and-drop optional for later).
3. **Basic Database Schema**:
    * Users, Organizations, Profiles.

### Phase 3: Directory & Profiles (Weeks 5-6)

*Objective: The "People & Directory" module.*

1. **Global Directory**:
    * Searchable list with filters (Org, Location, Skills).
    * Card view for users.
2. **User Profiles**:
    * Detailed view (Contact info, Expertise).
    * Edit functionality for self.

### Phase 4: Operations & Offline Sync (Weeks 7-8)

*Objective: Critical operational tools and offline resilience.*

1. **Offline Logic**:
    * Implement local storage strategy for critical data (Directory, recent docs).
    * Background sync queue for forms submitted offline.
2. **Operations Hub (MVP)**:
    * Basic Project listing.
    * Security Check-in feature (High priority).

## 4. Immediate Next Steps

1. **Scaffold the Application**: Initialize the Next.js project in `NEW`.
2. **Setup Design Tokens**: Create the `globals.css` with the color palette.
3. **Build the Shell**: Create the main layout wrapper.

---
*Created by Antigravity*
