# Login Flow Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AURUM VAULT ECOSYSTEM                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  Corporate Website   │         │   E-Banking Portal   │
│   (Port 3000)        │         │    (Port 4000)       │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │  Header        │  │         │  │  Login Page    │  │
│  │  - Login Btn ──┼──┼────────►│  │  (Index /)     │  │
│  └────────────────┘  │         │  └────────────────┘  │
│                      │         │         │            │
│  ┌────────────────┐  │         │         ▼            │
│  │  Hero Section  │  │         │  ┌────────────────┐  │
│  │  - E-Banking ──┼──┼────────►│  │  Dashboard     │  │
│  │    Widget      │  │         │  │  (/dashboard)  │  │
│  └────────────────┘  │         │  └────────────────┘  │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │  /login route  │  │         │  │  Unavailable   │  │
│  │  (Redirect) ───┼──┼────────►│  │  (/unavailable)│  │
│  └────────────────┘  │         │  └────────────────┘  │
└──────────────────────┘         └──────────────────────┘
           │                                │
           │                                │
           └────────────┬───────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   Backend API    │
              │   (Port 3001)    │
              │                  │
              │  /api/auth/login │
              │  /health         │
              │  /api/*          │
              └──────────────────┘
```

## Request Flow Diagram

### 1. User Clicks Login on Corporate Website

```
User Browser
    │
    │ 1. Click "Login"
    ▼
Corporate Website (localhost:3000)
    │
    │ 2. Redirect to portal
    ▼
E-Banking Portal (localhost:4000)
    │
    │ 3. Show login page
    ▼
User enters credentials
    │
    │ 4. Submit form
    ▼
Portal validates & calls API
    │
    │ 5. POST /api/auth/login
    ▼
Backend API (localhost:3001)
    │
    │ 6. Authenticate user
    │ 7. Return tokens
    ▼
Portal stores tokens
    │
    │ 8. Redirect to /dashboard
    ▼
Dashboard Page
```

### 2. Portal Health Check Flow

```
E-Banking Portal
    │
    │ Every 30 seconds
    ▼
PortalStatusIndicator Component
    │
    │ GET /health
    ▼
Backend API
    │
    │ Return status
    ▼
Update UI
    │
    ├─ Online  → Enable login
    ├─ Offline → Disable login
    └─ Maintenance → Show message
```

### 3. Service Unavailable Flow

```
User navigates to portal
    │
    ▼
Portal checks backend
    │
    ├─ Backend Online
    │   └─► Show login page
    │
    └─ Backend Offline
        └─► Redirect to /unavailable
            │
            ├─ Show error message
            ├─ Auto-check every 30s
            ├─ Manual refresh button
            └─ Link to corporate site
```

## Component Hierarchy

### E-Banking Portal (Login Page)

```
page.tsx (/)
│
├─ Background Image
│
├─ Login Card
│   ├─ Header
│   │   ├─ Title
│   │   └─ Description
│   │
│   ├─ PortalStatusIndicator
│   │   ├─ Health Check Logic
│   │   ├─ Status Display
│   │   └─ Auto-refresh
│   │
│   ├─ Error Messages
│   │
│   ├─ Login Form
│   │   ├─ Account Number Input
│   │   ├─ Password Input
│   │   ├─ Remember Me Checkbox
│   │   ├─ Forgot Password Link
│   │   └─ Submit Button
│   │
│   ├─ Registration Link
│   │   └─ → Corporate Website /signup
│   │
│   └─ Security Notice
│
└─ New User Info Card
    └─ → Corporate Website /apply
```

### Service Unavailable Page

```
unavailable/page.tsx
│
├─ Header (Corporate Style)
│   ├─ Logo
│   └─ Back to Website Button
│
├─ Main Content
│   ├─ Error Icon (Animated)
│   ├─ Title
│   ├─ Description
│   ├─ Status Info Card
│   ├─ Action Buttons
│   │   ├─ Check Status
│   │   └─ Return Home
│   ├─ Retry Count
│   └─ Contact Options
│       ├─ Phone
│       └─ Email
│
└─ Footer (Corporate Style)
    ├─ Company Info
    ├─ Quick Links
    └─ Contact Details
```

## Data Flow

### Authentication Token Flow

```
1. Login Request
   ┌─────────────┐
   │ User Input  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Validation  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ API Call    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Backend     │
   │ Auth        │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Return      │
   │ Tokens      │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Store in    │
   │ localStorage│
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Redirect to │
   │ Dashboard   │
   └─────────────┘
```

### Portal Status Check Flow

```
   ┌─────────────┐
   │ Component   │
   │ Mount       │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Start       │
   │ Interval    │
   │ (30s)       │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Fetch       │
   │ /health     │
   └──────┬──────┘
          │
     ┌────┴────┐
     │         │
     ▼         ▼
┌────────┐ ┌────────┐
│Success │ │ Error  │
└────┬───┘ └───┬────┘
     │         │
     ▼         ▼
┌────────┐ ┌────────┐
│Online  │ │Offline │
└────┬───┘ └───┬────┘
     │         │
     └────┬────┘
          │
          ▼
   ┌─────────────┐
   │ Update UI   │
   │ State       │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Notify      │
   │ Parent      │
   └─────────────┘
```

## Environment Variable Flow

```
┌──────────────────────────────────────┐
│     Environment Variables            │
└──────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
┌──────────────┐ ┌──────────────┐
│  Corporate   │ │  E-Banking   │
│  Website     │ │  Portal      │
└──────────────┘ └──────────────┘
        │               │
        │               │
NEXT_PUBLIC_        NEXT_PUBLIC_
PORTAL_URL          CORPORATE_URL
        │               │
        │               │
        └───────┬───────┘
                │
                ▼
        Cross-linking
        between apps
```

## Security Flow

```
┌─────────────┐
│ User Login  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ HTTPS/SSL   │
│ Encryption  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Backend     │
│ Validation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ JWT Token   │
│ Generation  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Secure      │
│ Storage     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Protected   │
│ Routes      │
└─────────────┘
```

---

**Legend:**

- `→` : Navigation/Redirect
- `▼` : Data Flow
- `├─` : Branch/Option
- `└─` : End Branch
