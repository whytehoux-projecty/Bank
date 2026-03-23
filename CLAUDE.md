# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**JP Heritage Bank** is a luxury banking platform (WSaaS) with four main services:
- **Backend API** (Fastify, port 3001) — core banking service
- **Admin Interface** (Fastify + EJS, port 3003) — operations dashboard
- **Heritage Vault** / E-Banking Portal (Next.js 15, port 4000) — customer-facing digital banking app
- **Corporate Website** (Next.js 14, port 3002) — public marketing site (JP Heritage Bank brand), deployed to Netlify

**Brand names:** Bank = "JP Heritage Bank", digital banking product = "Heritage Vault"

All backend services run in Docker. ngrok tunnels expose them publicly (backend, admin, portal).

## Development Commands

### Starting Services

```bash
# All backend services via Docker
docker compose up -d

# Individual service development (from service directory)
cd backend/core-api && npm run dev      # Core API with hot reload
cd admin-interface && npm run dev       # Admin with hot reload
cd e-banking-portal && npm run dev      # Portal (Next.js)
cd corporate-website && npm run dev     # Website (Next.js)

# All backend services concurrently (from backend/)
cd backend && npm run dev
```

### Building

```bash
cd backend && npm run build             # Build all backend services
cd backend && npm run build:shared      # Build shared library first if types changed
cd backend/core-api && npm run build
cd e-banking-portal && npm run build
cd corporate-website && npm run build
```

### Testing

```bash
# From each service directory:
npm test                    # Run all unit/integration tests
npm run test:coverage       # With coverage report
npm run test:e2e            # Playwright E2E tests (admin-interface, e-banking-portal)

# Single test file (Jest):
npx jest src/services/auth.service.test.ts
npx jest --testPathPattern="auth"

# Backend from root:
cd backend && npm run test:api
```

### Linting & Type Checking

```bash
npm run lint                # ESLint
npm run lint:fix            # Auto-fix
npm run format              # Prettier
npm run type-check          # TypeScript (core-api)
```

### Database

```bash
cd backend && npm run db:migrate        # Run Prisma migrations
cd backend && npm run db:generate       # Regenerate Prisma client (after schema changes)
cd backend && npm run db:seed           # Seed database
cd backend && npm run db:studio         # Open Prisma Studio UI
```

## Architecture

### Service Communication

```
Corporate Website (Netlify) → Login redirect → E-Banking Portal
E-Banking Portal → REST API calls → Backend Core API
Admin Interface  → REST API calls → Backend Core API
Backend Core API → PostgreSQL + Redis (Docker)
```

### Backend Core API (`/backend/core-api/`)

Fastify app with this structure:
- `src/routes/` — route handlers (auth, users, accounts, transactions, kyc, wire-transfers, cards, beneficiaries, bills, loans, notifications, statements, portal, admin/verifications)
- `src/services/` — business logic layer
- `src/middleware/` — JWT auth, rate limiting, CORS, Helmet
- `src/plugins/` — Fastify plugins
- `prisma/schema.prisma` — single schema for all models

Key models: `User`, `Account`, `Transaction`, `WireTransfer`, `Card`, `KycDocument`, `AdminUser`, `AuditLog`, `Loan`, `Bill`, `Notification`

### Shared Library (`/backend/shared/`)

Must be built before core-api or admin-interface if types changed:
```bash
cd backend && npm run build:shared
```
Contains: TypeScript interfaces, Zod validation schemas, constants, financial/date/ID utilities.

### Admin Interface (`/admin-interface/`)

Fastify server rendering EJS templates with Tailwind CSS. Has its own Prisma client pointing at the same PostgreSQL instance.

### E-Banking Portal (`/e-banking-portal/`)

Next.js 15 with React 19. All API calls go to the Core API via `NEXT_PUBLIC_API_URL`. Pages follow the banking domain: dashboard, accounts, transactions, transfers, bills, beneficiaries, statements, settings, support, cards.

**Completion status (as of 2026-03-23):** ~95% overall after major implementation sprint. Most stubs eliminated.

Remaining known gaps (infrastructure/integration-only):
- **Savings goals:** `app/api/savings-goals/route.ts` — Edge runtime in-memory, resets on restart
- **No real email delivery:** Customer notification emails are `console.info` unless `SMTP_HOST` env var is set
- **JWT tokens in localStorage** — XSS risk; server-side middleware is a no-op for auth enforcement
- **Invoice OCR:** Returns 422 → manual entry (real OCR needs AWS Textract / Google Vision)
- **Credit Score widget:** Labeled "Estimated" — requires credit bureau API integration

Local Next.js API routes (Edge runtime, not backend): `app/api/bills/providers/route.ts` (hardcoded provider list), `app/api/bills/upload-invoice/route.ts` (returns 422 → manual entry), `app/api/savings-goals/route.ts` (in-memory).

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL`, `REDIS_URL` — auto-configured in Docker
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_JWT_SECRET`, `SESSION_SECRET` — 32-char base64 strings
- `NGROK_BACKEND_URL`, `NGROK_ADMIN_URL`, `NGROK_PORTAL_URL` — from ngrok dashboard
- `CORPORATE_URL` — Netlify deployment URL

Node version: **18.19.0** (see `.nvmrc`)

## Key Constraints

- **ngrok tunnels** are required for cross-service communication in non-Docker dev. The e-banking portal must have `NEXT_PUBLIC_API_URL` set to the ngrok backend URL.
- **Shared library** must be rebuilt whenever types/schemas in `/backend/shared/` change.
- **Prisma client** must be regenerated (`npm run db:generate`) after any schema changes before running services.
- Admin interface uses `ADMIN_JWT_SECRET` (separate from user JWT secrets).
- The corporate website is deployed to Netlify independently — changes there require a Netlify deploy, not Docker.
