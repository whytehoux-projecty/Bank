# 🎨 Dashboard UI/UX Design Specification

**Organization:** United Health Initiatives  
**Version:** 2.0  
**Date:** January 10, 2026

---

## Design Overview

### Design Philosophy

The UHI Staff Portal should embody:

- **Trust & Security:** Clean, professional appearance
- **Humanitarian Spirit:** Warm but authoritative colors
- **Efficiency:** Clear information hierarchy
- **Accessibility:** WCAG 2.1 AA compliant

### Brand Colors

```css
:root {
  /* Primary Palette - USAID/UN Inspired */
  --uhi-primary: #002F6C;        /* USAID Navy Blue */
  --uhi-primary-light: #0067B9;
  --uhi-primary-dark: #001F4A;
  
  /* Accent Colors */
  --uhi-accent: #009EDB;         /* UN Light Blue */
  --uhi-accent-light: #4FC3F7;
  
  /* Humanitarian Red */
  --uhi-red: #C8102E;            /* Humanitarian Red */
  --uhi-red-light: #FF4C4C;
  
  /* Status Colors */
  --status-deployed: #E65100;    /* Orange for field staff */
  --status-office: #1976D2;      /* Blue for office staff */
  --status-leave: #7B1FA2;       /* Purple for on leave */
  --status-success: #2E7D32;
  --status-warning: #F57C00;
  --status-danger: #D32F2F;
  
  /* Neutrals */
  --text-primary: #1A1A2E;
  --text-secondary: #4A4A5E;
  --text-muted: #6B7280;
  --bg-light: #F5F5F7;
  --bg-white: #FFFFFF;
  --border-color: #E5E7EB;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #002F6C 0%, #0067B9 100%);
  --gradient-accent: linear-gradient(135deg, #009EDB 0%, #00BCD4 100%);
}
```

### Typography

```css
:root {
  /* Font Family */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Outfit', 'Inter', sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

---

## Dashboard Layout

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: United Health Initiatives │ Search │ Notifications │ Profile  │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│  SIDE   │  MAIN CONTENT AREA                                           │
│  NAV    │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐ │
│  • Home │  │  WELCOME HERO SECTION                                   │ │
│  • Work │  └─────────────────────────────────────────────────────────┘ │
│  • Apps │                                                               │
│  • Fin  │  ┌───────────────────────────┐  ┌─────────────────────────┐ │
│  • ...  │  │  STAFF ID CARD            │  │  QUICK INFO PANEL       │ │
│         │  │  (Large Photo)            │  │                         │ │
│         │  │                           │  │  Name, Position, Dept   │ │
│         │  │                           │  │  Current Deployment     │ │
│         │  └───────────────────────────┘  └─────────────────────────┘ │
│         │                                                               │
│         │  ┌─────────────────────────────────────────────────────────┐ │
│         │  │  BANK ACCOUNT DETAILS (View Only)                       │ │
│         │  └─────────────────────────────────────────────────────────┘ │
│         │                                                               │
│         │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│         │  │ Leave    │ │ Pending  │ │ Salary   │ │ Loans    │       │
│         │  │ Balance  │ │ Apps     │ │ Status   │ │ Info     │       │
│         │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│         │                                                               │
└─────────┴───────────────────────────────────────────────────────────────┘
```

---

## Staff ID Card Component

### Design Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAFF IDENTITY CARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────┐    ┌───────────────────────────┐ │
│  │                           │    │                           │ │
│  │                           │    │  UNITED HEALTH            │ │
│  │                           │    │  INITIATIVES              │ │
│  │    ┌─────────────────┐    │    │                           │ │
│  │    │                 │    │    │  Dr. Jonathan Smith       │ │
│  │    │                 │    │    │  Staff ID: UHI-2024-00142 │ │
│  │    │   PASSPORT      │    │    │                           │ │
│  │    │   PHOTOGRAPH    │    │    │  Position:                │ │
│  │    │   220px × 280px │    │    │  Field Physician          │ │
│  │    │                 │    │    │                           │ │
│  │    │                 │    │    │  Department:              │ │
│  │    └─────────────────┘    │    │  Medical Services         │ │
│  │                           │    │                           │ │
│  │    ┌─────────────────┐    │    │  Staff Type:              │ │
│  │    │ ▄▄▄ ▄▄▄ ▄▄▄ ▄▄ │    │    │  🏥 FIELD STAFF          │ │
│  │    │ Barcode/QR     │    │    │                           │ │
│  │    └─────────────────┘    │    │  Status: ✓ ACTIVE        │ │
│  │                           │    │                           │ │
│  └───────────────────────────┘    └───────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications

| Element | Specification |
|---------|---------------|
| **Container** | |
| Width | 100% (max-width: 720px) |
| Background | White with subtle gradient border |
| Border | 2px solid with gradient |
| Border Radius | 16px |
| Shadow | 0 8px 32px rgba(0, 47, 108, 0.12) |
| Padding | 24px |
| **Photo Container** | |
| Width | 220px |
| Height | 280px (3:4 ratio) |
| Border | 3px solid #002F6C |
| Border Radius | 12px |
| Background | #F5F5F7 (placeholder) |
| Object Fit | cover |
| **Barcode/QR** | |
| Width | 180px |
| Height | 50px |
| Format | Code-128 or QR Code |
| Content | Staff ID |

### CSS Implementation

```css
.staff-id-card {
  display: flex;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 24px;
  gap: 32px;
  box-shadow: 0 8px 32px rgba(0, 47, 108, 0.12);
  position: relative;
  overflow: hidden;
}

.staff-id-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, #002F6C, #009EDB);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.photo-container {
  width: 220px;
  height: 280px;
  border: 3px solid var(--uhi-primary);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E3F2FD 0%, #F5F5F7 100%);
}

.photo-placeholder .initials {
  font-size: 72px;
  font-weight: 700;
  color: var(--uhi-primary);
  opacity: 0.6;
}

.staff-barcode {
  width: 180px;
  height: 50px;
  background: white;
  padding: 8px;
  border-radius: 4px;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.org-logo {
  height: 40px;
  margin-bottom: 8px;
}

.staff-name {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.staff-id-number {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--uhi-primary);
  font-family: 'Roboto Mono', monospace;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.staff-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.staff-type-badge.field {
  background: #FFF3E0;
  color: #E65100;
}

.staff-type-badge.non-field {
  background: #E3F2FD;
  color: #1976D2;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.status-badge.active {
  color: var(--status-success);
}

.status-badge.inactive {
  color: var(--status-danger);
}
```

### HTML Structure

```html
<div class="staff-id-card">
  <div class="photo-section">
    <div class="photo-container">
      <!-- If photo exists -->
      <img src="..." alt="Staff Photo" id="staffPhoto" />
      
      <!-- If no photo (placeholder) -->
      <div class="photo-placeholder">
        <span class="initials">JS</span>
      </div>
    </div>
    
    <div class="staff-barcode">
      <svg id="staffBarcode"></svg>
    </div>
  </div>
  
  <div class="info-section">
    <img src="assets/logo.svg" alt="UHI Logo" class="org-logo" />
    
    <h2 class="staff-name" id="staffFullName">Dr. Jonathan Smith</h2>
    <span class="staff-id-number" id="staffIdNumber">UHI-2024-00142</span>
    
    <div class="info-row">
      <span class="info-label">Position</span>
      <span class="info-value" id="staffPosition">Field Physician</span>
    </div>
    
    <div class="info-row">
      <span class="info-label">Department</span>
      <span class="info-value" id="staffDepartment">Medical Services</span>
    </div>
    
    <div class="info-row">
      <span class="info-label">Staff Type</span>
      <span class="staff-type-badge field" id="staffTypeBadge">
        🏥 FIELD STAFF
      </span>
    </div>
    
    <div class="info-row">
      <span class="status-badge active" id="staffStatus">
        ✓ ACTIVE
      </span>
    </div>
  </div>
</div>
```

---

## Bank Account Display Component

### Design Specification

```
┌─────────────────────────────────────────────────────────────────┐
│  🏦 SALARY BANK ACCOUNT                              View Only  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bank Name          First National Bank                         │
│  Account Holder     John Smith                                   │
│  Account Number     ****4567                                     │
│  SWIFT Code         FNBKUS33XXX                                  │
│  Currency           USD ($)                                      │
│                                                                  │
│  ⓘ Contact HR/Admin to update bank account details              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### CSS Implementation

```css
.bank-account-card {
  background: linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.bank-account-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none;
}

.bank-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.bank-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.view-only-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.bank-details {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
}

.bank-label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
}

.bank-value {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.bank-value.masked {
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 2px;
}

.bank-notice {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
}
```

---

## Current Deployment Widget

### Design Specification

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 CURRENT DEPLOYMENT                                   ACTIVE │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Syria Emergency Response                                        │
│  Mission Code: SYR-2025-001                                     │
│                                                                  │
│  📍 Damascus, Syria                                              │
│  📅 Oct 15, 2025 → Apr 15, 2026                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ████████████████████████░░░░░░░░░░  65% Complete       │   │
│  │  87 days remaining                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Hardship: E (Extreme)  │  Danger Pay: Yes  │  R&R: Eligible   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Stats Grid

### Design Specification

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 📅          │  │ 📋          │  │ 💰          │  │ 💳          │
│ LEAVE       │  │ PENDING     │  │ SALARY      │  │ LOANS       │
│             │  │ APPLICATIONS│  │ STATUS      │  │             │
│    14       │  │      2      │  │    PAID     │  │   $2,450    │
│   days      │  │   pending   │  │   Jan 2026  │  │  balance    │
│ available   │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small devices (phones, 640px and up) */
@media (min-width: 640px) {
  /* ... */
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .staff-id-card {
    flex-direction: row;
  }
  
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Extra large devices (1280px and up) */
@media (min-width: 1280px) {
  .main-content {
    max-width: 1200px;
  }
}
```

---

## Animation Guidelines

```css
/* Smooth transitions */
:root {
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}

/* Card hover effect */
.stat-card {
  transition: transform var(--transition-base), 
              box-shadow var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 47, 108, 0.15);
}

/* Photo fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.photo-container img {
  animation: fadeIn 0.5s ease;
}

/* Progress bar animation */
@keyframes progressFill {
  from {
    width: 0;
  }
}

.progress-bar {
  animation: progressFill 1s ease-out;
}
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | Minimum 4.5:1 for text |
| Focus Indicators | Visible focus rings on all interactive elements |
| Keyboard Navigation | Full keyboard support |
| Screen Reader | Proper ARIA labels and roles |
| Alt Text | All images have descriptive alt text |
| Skip Links | Skip to main content link |

### ARIA Implementation

```html
<main role="main" aria-label="Dashboard">
  <section aria-labelledby="id-card-heading">
    <h2 id="id-card-heading" class="sr-only">Staff Identity Card</h2>
    <div class="staff-id-card" role="region">
      <img src="..." alt="Staff passport photograph of Dr. Jonathan Smith" />
    </div>
  </section>
  
  <section aria-labelledby="bank-heading">
    <h2 id="bank-heading" class="sr-only">Bank Account Information</h2>
    <div class="bank-account-card" role="region">
      <!-- Bank details with aria-labels -->
    </div>
  </section>
</main>
```

---

*Design Specification Version 2.0*  
*For United Health Initiatives Staff Portal*
