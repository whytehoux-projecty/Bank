# 🚀 Staff Portal Backend - Master Implementation Plan

> **Version**: 1.0  
> **Date**: January 2026  
> **Status**: High-Level Design Complete | Implementation Pending

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Backend Objectives](#3-backend-objectives)
4. [System Architecture](#4-system-architecture)
5. [Feature Modules](#5-feature-modules)
6. [Admin Content Management System (CMS)](#6-admin-content-management-system-cms)
7. [API Strategy](#7-api-strategy)
8. [Database Design](#8-database-design)
9. [Security Framework](#9-security-framework)
10. [Implementation Phases](#10-implementation-phases)
11. [Technology Decisions](#11-technology-decisions)
12. [DevOps & Deployment](#12-devops--deployment)
13. [Testing Strategy](#13-testing-strategy)
14. [Related Documentation](#14-related-documentation)

---

## 1. Executive Summary

### Purpose

This document serves as the **single source of truth** for the Staff Portal backend development. It consolidates all existing documentation and provides a comprehensive roadmap for building a production-grade backend system for a **Medical Humanitarian/USAID-affiliated Organization**.

### Scope

- RESTful API backend for the Staff Portal frontend
- Admin Content Management System (CMS) for dynamic branding
- User authentication and role-based access control
- Staff management (profiles, employment, contracts)
- Finance module (payroll, loans, benefits)
- Application workflow engine (leave, transfers, training)
- Document management and storage
- Audit logging and compliance

### Key Differentiator

The backend will include a **headless CMS capability** allowing administrators to:

- ✅ Change organization logos across all pages
- ✅ Update portal name, titles, and descriptions
- ✅ Modify static text content on user-facing pages
- ✅ Configure color themes and branding
- ✅ All without requiring code changes or redeployment

---

## 2. Current State Analysis

### 2.1 What Has Been Built (Frontend)

| Component | File Location | Status |
|-----------|---------------|--------|
| **Login Page** | `index.html` | ✅ Complete - Split layout with background image |
| **Dashboard** | `dashboard.html` | ✅ Complete - Bio, quick links, employment snapshot |
| **Employment** | `employment.html` | ✅ Complete - Contract history, KPIs, documents |
| **Finance** | `finance.html` | ✅ Complete - Payroll, loans, benefits |
| **Applications** | `applications.html` | ✅ Complete - Leave, transfers, forms |
| **Admin Dashboard** | `admin/admin_interface.html` | ✅ Complete - Stats, applications, activity |
| **Styling** | `css/styles.css`, `login.css`, `dashboard.css` | ✅ Complete |
| **Auth JS** | `js/auth.js` | ⚠️ Stub - Needs real API integration |
| **Common JS** | `js/common.js` | ⚠️ Stub - Needs real API integration |

### 2.2 What Needs to Be Built (Backend)

| Component | Priority | Complexity |
|-----------|----------|------------|
| Authentication Service | 🔴 Critical | Medium |
| User/Staff Management API | 🔴 Critical | Medium |
| Profile & Employment API | 🔴 Critical | Medium |
| Finance/Payroll API | 🟡 High | High |
| Applications Workflow API | 🟡 High | High |
| Admin CMS API (Branding) | 🟡 High | Medium |
| Document Storage Service | 🟢 Medium | Medium |
| Notification Service | 🟢 Medium | Low |
| Reporting/Analytics API | 🟢 Medium | Medium |

### 2.3 Current Assets

```
staff-portal/assets/
├── images/
│   ├── login-bg.png       # Humanitarian field hospital scene
│   ├── logo.png           # Global Health Aid logo
│   ├── avatar-placeholder.png
│   └── header-bg.png
└── participating-organization_logos/
    └── (29 partner logos)
```

---

## 3. Backend Objectives

### 3.1 Functional Objectives

1. **Secure Authentication**: JWT-based auth with MFA support
2. **Staff Self-Service**: Profile viewing, application submission
3. **Admin Control**: User management, application approval, content editing
4. **Data Integrity**: ACID-compliant transactions for financial data
5. **Audit Trail**: Complete logging of all actions

### 3.2 Non-Functional Objectives

1. **Performance**: API response < 200ms for 95th percentile
2. **Availability**: 99.9% uptime target
3. **Scalability**: Handle 5,000+ concurrent users
4. **Security**: OWASP Top 10 compliant
5. **Compliance**: GDPR-ready data handling

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ Staff Portal │  │ Admin Portal │  │ Mobile Apps  │               │
│  │   (HTML/JS)  │  │   (HTML/JS)  │  │  (Future)    │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER / NGINX                            │
│              (SSL Termination, Rate Limiting)                       │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Express.js Application                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │   Auth   │  │  Staff   │  │ Finance  │  │  Admin   │       │ │
│  │  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │       │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │ │
│  └───────┼─────────────┼─────────────┼─────────────┼─────────────┘ │
│          └─────────────┴─────────────┴─────────────┘               │
│                              │                                      │
│                              ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     MIDDLEWARE LAYER                           │ │
│  │    Auth │ Validation │ Rate Limit │ Logger │ Error Handler     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     SERVICE LAYER                              │ │
│  │ AuthService │ StaffService │ FinanceService │ CMSService       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   DATA ACCESS LAYER                            │ │
│  │              Prisma ORM / Repository Pattern                   │ │
│  └─────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │      Redis       │ │   AWS S3/MinIO   │
│   (Primary DB)   │ │  (Cache/Session) │ │  (File Storage)  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### 4.2 Folder Structure

```
backend/
├── src/
│   ├── config/                 # Environment, database config
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── index.ts
│   │
│   ├── modules/               # Feature-based organization
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.middleware.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── staff/
│   │   │   ├── staff.controller.ts
│   │   │   ├── staff.service.ts
│   │   │   ├── staff.routes.ts
│   │   │   └── staff.types.ts
│   │   │
│   │   ├── finance/
│   │   │   ├── finance.controller.ts
│   │   │   ├── finance.service.ts
│   │   │   ├── finance.routes.ts
│   │   │   └── finance.types.ts
│   │   │
│   │   ├── applications/
│   │   │   ├── application.controller.ts
│   │   │   ├── application.service.ts
│   │   │   ├── workflow.service.ts
│   │   │   ├── application.routes.ts
│   │   │   └── application.types.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── admin.types.ts
│   │   │
│   │   └── cms/               # Content Management System
│   │       ├── cms.controller.ts
│   │       ├── cms.service.ts
│   │       ├── cms.routes.ts
│   │       └── cms.types.ts
│   │
│   ├── shared/                # Shared utilities
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── encryption.ts
│   │   │   ├── pdfGenerator.ts
│   │   │   └── emailService.ts
│   │   └── types/
│   │       └── global.d.ts
│   │
│   ├── prisma/                # Database
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. Feature Modules

### 5.1 Authentication Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Authenticate user, return JWT |
| `/api/v1/auth/refresh` | POST | Refresh access token |
| `/api/v1/auth/logout` | POST | Invalidate session |
| `/api/v1/auth/forgot-password` | POST | Initiate password reset |
| `/api/v1/auth/reset-password` | POST | Complete password reset |
| `/api/v1/auth/mfa/setup` | POST | Setup MFA (TOTP) |
| `/api/v1/auth/mfa/verify` | POST | Verify MFA code |

### 5.2 Staff Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/staff/profile` | GET | Get current user profile |
| `/api/v1/staff/profile` | PUT | Update contact info |
| `/api/v1/staff/employment` | GET | Get employment history |
| `/api/v1/staff/documents` | GET | List staff documents |
| `/api/v1/staff/documents/:id` | GET | Download document |

### 5.3 Finance Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/finance/payroll` | GET | Get payroll history |
| `/api/v1/finance/payroll/:id/pdf` | GET | Download payslip PDF |
| `/api/v1/finance/loans` | GET | Get loan information |
| `/api/v1/finance/benefits` | GET | Get benefits summary |

### 5.4 Applications Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/applications` | GET | List user's applications |
| `/api/v1/applications` | POST | Submit new application |
| `/api/v1/applications/:id` | GET | Get application details |
| `/api/v1/applications/:id` | DELETE | Cancel pending application |
| `/api/v1/applications/:id/attachments` | POST | Upload attachment |

### 5.5 Admin Module

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/admin/users` | GET | List all staff (paginated) |
| `/api/v1/admin/users` | POST | Create new staff account |
| `/api/v1/admin/users/:id` | GET/PUT/DELETE | Manage staff |
| `/api/v1/admin/applications/pending` | GET | Get pending approvals |
| `/api/v1/admin/applications/:id/decide` | PUT | Approve/reject |
| `/api/v1/admin/payroll/process` | POST | Trigger payroll run |
| `/api/v1/admin/reports/:type` | GET | Generate reports |

---

## 6. Admin Content Management System (CMS)

### 6.1 Overview

The CMS module allows administrators to **dynamically update website content** without code changes:

```
┌────────────────────────────────────────────────────────────────┐
│                    ADMIN CMS INTERFACE                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  🖼️ BRANDING SETTINGS                                    │ │
│  │  ├── Organization Logo (Upload)                          │ │
│  │  ├── Login Background Image (Upload)                     │ │
│  │  ├── Portal Title: [Global Staff Portal    ]             │ │
│  │  ├── Primary Color: [#0066CC] 🎨                         │ │
│  │  └── [Save Changes]                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  📝 PAGE CONTENT                                         │ │
│  │  ├── Login Page                                           │ │
│  │  │   ├── Subtitle: [Secure Access System]                │ │
│  │  │   └── Support Email: [support@org.com]                │ │
│  │  ├── Dashboard                                            │ │
│  │  │   └── Welcome Message: [Welcome back, {name}]         │ │
│  │  └── Footer                                               │ │
│  │      └── Copyright Text: [© 2025 Organization]           │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 CMS Database Schema

```sql
-- Dynamic content storage
CREATE TABLE cms_settings (
    id            SERIAL PRIMARY KEY,
    setting_key   VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type  VARCHAR(20) NOT NULL, -- 'text', 'image_url', 'color', 'boolean'
    category      VARCHAR(50) NOT NULL, -- 'branding', 'login', 'dashboard', 'footer'
    description   TEXT,
    updated_by    UUID REFERENCES users(id),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Predefined settings
INSERT INTO cms_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Branding
('org_logo_url', '/assets/images/logo.png', 'image_url', 'branding', 'Organization logo'),
('org_logo_light_url', '/assets/images/logo-white.png', 'image_url', 'branding', 'Logo for dark backgrounds'),
('portal_name', 'Global Staff Portal', 'text', 'branding', 'Portal title in header'),
('primary_color', '#0066CC', 'color', 'branding', 'Primary brand color'),
('secondary_color', '#004C99', 'color', 'branding', 'Secondary brand color'),

-- Login Page
('login_bg_url', '/assets/images/login-bg.png', 'image_url', 'login', 'Login background image'),
('login_subtitle', 'Secure Access System', 'text', 'login', 'Subtitle under logo'),
('support_email', 'support@organization.org', 'text', 'login', 'IT support email'),

-- Dashboard
('dashboard_welcome', 'Welcome back, {name}', 'text', 'dashboard', 'Welcome message template'),

-- Footer
('copyright_text', '© 2025 Global Organization. All rights reserved.', 'text', 'footer', 'Copyright notice'),
('privacy_policy_url', '/privacy.html', 'text', 'footer', 'Privacy policy link'),
('terms_url', '/terms.html', 'text', 'footer', 'Terms of use link');
```

### 6.3 CMS API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/cms/settings` | GET | Public | Get all public settings (for frontend) |
| `/api/v1/cms/settings/:category` | GET | Public | Get settings by category |
| `/api/v1/admin/cms/settings` | GET | Admin | Get all settings with metadata |
| `/api/v1/admin/cms/settings` | PUT | Admin | Bulk update settings |
| `/api/v1/admin/cms/settings/:key` | PUT | Admin | Update single setting |
| `/api/v1/admin/cms/upload/logo` | POST | Admin | Upload logo image |
| `/api/v1/admin/cms/upload/background` | POST | Admin | Upload background image |

### 6.4 Frontend Integration

The frontend will fetch CMS settings on page load and apply them dynamically:

```javascript
// js/cms.js - CMS Integration Module
const CMS = {
    settings: {},

    async init() {
        try {
            const response = await fetch('/api/v1/cms/settings');
            this.settings = await response.json();
            this.apply();
        } catch (error) {
            console.warn('CMS settings not available, using defaults');
        }
    },

    apply() {
        // Apply logo
        document.querySelectorAll('[data-cms="org_logo"]').forEach(el => {
            el.src = this.settings.org_logo_url || '/assets/images/logo.png';
        });

        // Apply portal name
        document.querySelectorAll('[data-cms="portal_name"]').forEach(el => {
            el.textContent = this.settings.portal_name || 'Global Staff Portal';
        });

        // Apply primary color
        if (this.settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', this.settings.primary_color);
        }

        // Apply footer text
        document.querySelectorAll('[data-cms="copyright_text"]').forEach(el => {
            el.textContent = this.settings.copyright_text;
        });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => CMS.init());
```

### 6.5 HTML Markup Changes

Update HTML files to use CMS data attributes:

```html
<!-- Before -->
<img src="assets/images/logo.png" alt="Logo">
<h1>Global Staff Portal</h1>

<!-- After (CMS-enabled) -->
<img data-cms="org_logo" src="assets/images/logo.png" alt="Logo">
<h1 data-cms="portal_name">Global Staff Portal</h1>
```

### 6.6 Admin CMS Interface

Add a new settings page at `admin/settings.html`:

**Key Features:**

1. **Logo Upload** - Drag-and-drop or file picker
2. **Text Editor** - Simple input fields for text content
3. **Color Picker** - Visual color selection for branding
4. **Preview Mode** - See changes before publishing
5. **Revision History** - Track who changed what and when

---

## 7. API Strategy

### 7.1 API Design Principles

- **RESTful**: Resource-based URLs, proper HTTP methods
- **Versioned**: All endpoints prefixed with `/api/v1/`
- **Consistent**: Standard response format across all endpoints
- **Documented**: OpenAPI/Swagger specification

### 7.2 Standard Response Format

**Success Response:**

```json
{
    "success": true,
    "data": { ... },
    "meta": {
        "page": 1,
        "limit": 20,
        "total": 150
    }
}
```

**Error Response:**

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Start date cannot be in the past",
        "details": [
            { "field": "startDate", "message": "Must be a future date" }
        ]
    }
}
```

### 7.3 Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │  API    │                    │   DB    │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                              │
     │ POST /auth/login              │                              │
     │ {staffId, password}           │                              │
     │──────────────────────────────>│                              │
     │                               │  Verify credentials          │
     │                               │─────────────────────────────>│
     │                               │<─────────────────────────────│
     │                               │                              │
     │   {token, refreshToken}       │                              │
     │<──────────────────────────────│                              │
     │                               │                              │
     │ GET /staff/profile            │                              │
     │ Authorization: Bearer <token> │                              │
     │──────────────────────────────>│                              │
     │                               │  Validate JWT                │
     │                               │  Fetch user data             │
     │                               │─────────────────────────────>│
     │                               │<─────────────────────────────│
     │   {profile data}              │                              │
     │<──────────────────────────────│                              │
```

---

## 8. Database Design

> **Detailed schema in:** `docs/backend/database_schema.md`

### 8.1 Core Tables Summary

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | Staff accounts | Has many: contracts, payroll, applications |
| `roles` | Permission definitions | Many-to-many with users |
| `contracts` | Employment contracts | Belongs to user, department |
| `employment_history` | Position changes | Belongs to user |
| `payroll_records` | Monthly salary records | Belongs to user |
| `loans` | Staff loan tracking | Belongs to user |
| `applications` | Leave/transfer requests | Belongs to user, has audit trail |
| `cms_settings` | Dynamic content | Updated by admin users |
| `audit_logs` | Action history | References users |

### 8.2 CMS Settings Table (New)

See section 6.2 above.

---

## 9. Security Framework

> **Detailed policy in:** `docs/backend/security_policy.md`

### 9.1 Security Layers

1. **Network**: TLS 1.3, HSTS, WAF
2. **Application**: Input validation, XSS prevention, CSRF tokens
3. **Authentication**: JWT, MFA, session management
4. **Authorization**: RBAC, API-level permissions
5. **Data**: Encryption at rest, column-level encryption for PII
6. **Audit**: Complete action logging

### 9.2 Role Permissions Matrix

| Permission | Staff | Supervisor | HR Manager | Finance | Admin |
|------------|-------|------------|------------|---------|-------|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| View team profiles | ❌ | ✅ | ✅ | ❌ | ✅ |
| View all profiles | ❌ | ❌ | ✅ | ❌ | ✅ |
| Submit applications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve applications | ❌ | ✅ | ✅ | ❌ | ✅ |
| View own payroll | ✅ | ✅ | ✅ | ✅ | ✅ |
| Process payroll | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage CMS content | ❌ | ❌ | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 10. Implementation Phases

> **Detailed roadmap in:** `docs/backend/implementation_roadmap.md`

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: Foundation (Weeks 1-2)                                    │
│  ├── Project setup (Node.js, TypeScript, Docker)                    │
│  ├── Database schema + migrations                                   │
│  ├── Authentication API (login, logout, refresh)                    │
│  └── Basic middleware (auth, logging, error handling)               │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 2: Staff Core (Weeks 3-4)                                    │
│  ├── Staff profile API                                              │
│  ├── Employment history API                                         │
│  ├── Document management                                            │
│  └── CMS Settings API (branding, content)                           │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 3: Finance Engine (Weeks 5-6)                                │
│  ├── Payroll API                                                    │
│  ├── Loans API                                                      │
│  ├── PDF payslip generation                                         │
│  └── Benefits API                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 4: Workflow System (Weeks 7-8)                               │
│  ├── Application submission API                                     │
│  ├── Approval workflow engine                                       │
│  ├── Notification service                                           │
│  └── Leave balance calculations                                     │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 5: Admin & Reporting (Weeks 9-10)                            │
│  ├── User management API                                            │
│  ├── Bulk operations                                                │
│  ├── Reporting/analytics endpoints                                  │
│  └── Audit log viewer                                               │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 6: Hardening & Launch (Weeks 11-12)                          │
│  ├── Security audit + penetration testing                           │
│  ├── Performance optimization                                       │
│  ├── Load testing                                                   │
│  ├── CI/CD pipeline                                                 │
│  └── Production deployment                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Technology Decisions

### 11.1 Core Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Runtime | Node.js | 20 LTS | Async I/O, large ecosystem |
| Language | TypeScript | 5.x | Type safety for data integrity |
| Framework | Express.js | 4.x | Minimalist, flexible |
| ORM | Prisma | 5.x | Type-safe, migrations |
| Database | PostgreSQL | 15+ | ACID, JSON support |
| Cache | Redis | 7.x | Session, caching |
| Storage | MinIO/S3 | - | Document storage |

### 11.2 Supporting Libraries

| Purpose | Library |
|---------|---------|
| Validation | Zod |
| Authentication | Passport.js + JWT |
| Password Hashing | bcrypt |
| Rate Limiting | express-rate-limit |
| Security Headers | Helmet |
| Logging | Winston + Morgan |
| PDF Generation | PDFKit |
| Email | Nodemailer |
| Testing | Jest + Supertest |

---

## 12. DevOps & Deployment

### 12.1 Docker Compose (Development)

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/staff_portal
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=staff_portal
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ../staff-portal:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf

volumes:
  postgres_data:
  redis_data:
```

### 12.2 CI/CD Pipeline (GitHub Actions)

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t staff-portal-api .
      - run: docker push ${{ secrets.REGISTRY }}/staff-portal-api:${{ github.sha }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: kubectl set image deployment/api api=${{ secrets.REGISTRY }}/staff-portal-api:${{ github.sha }}
```

---

## 13. Testing Strategy

### 13.1 Test Pyramid

```
                    ┌─────────────┐
                    │    E2E      │  10%
                    │   Tests     │
                ┌───┴─────────────┴───┐
                │    Integration      │  30%
                │       Tests         │
            ┌───┴─────────────────────┴───┐
            │         Unit Tests          │  60%
            │    (Services, Utils)        │
            └─────────────────────────────┘
```

### 13.2 Coverage Targets

| Module | Target Coverage |
|--------|-----------------|
| Auth | 95% |
| Staff | 85% |
| Finance | 90% |
| Applications | 85% |
| CMS | 80% |
| Overall | 85% |

---

## 14. Related Documentation

| Document | Location | Description |
|----------|----------|-------------|
| Architecture Overview | `docs/backend/architecture_overview.md` | System design details |
| API Specification | `docs/backend/api_specification.md` | Endpoint definitions |
| Database Schema | `docs/backend/database_schema.md` | Table structures |
| Implementation Roadmap | `docs/backend/implementation_roadmap.md` | Phased timeline |
| Security Policy | `docs/backend/security_policy.md` | Security measures |
| Deployment Guide | `docs/deployment_guide.md` | Setup instructions |
| Implementation Summary | `docs/implementation_summary.md` | Quick start guide |

---

## ✅ Checklist for Starting Development

- [ ] Review all related documentation (Section 14)
- [ ] Set up development environment (Docker, Node.js 20)
- [ ] Create `.env` file from `.env.example`
- [ ] Run database migrations
- [ ] Start with Phase 1: Authentication module
- [ ] Implement CMS module in Phase 2 for admin branding control
- [ ] Write tests alongside feature development
- [ ] Document API changes in OpenAPI spec

---

## 🎯 Key Success Metrics

| Metric | Target |
|--------|--------|
| API Response Time (P95) | < 200ms |
| Test Coverage | > 85% |
| Uptime | 99.9% |
| Security Audit Score | A/A+ |
| Time to First Feature | 2 weeks |
| Full MVP Delivery | 12 weeks |

---

**Document Maintained By**: Development Team  
**Last Updated**: January 2026  
**Next Review**: Before Phase 2 kickoff
