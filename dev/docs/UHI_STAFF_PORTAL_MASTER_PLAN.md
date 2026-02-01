# 🏥 United Health Initiatives - Staff Portal Master Implementation Plan

**Organization:** United Health Initiatives (UHI)  
**Affiliation:** USAID / United Nations Partner  
**Document Version:** 1.0  
**Date:** January 10, 2026  
**Classification:** Internal Development Document

---

## 🌍 Organization Context

### About United Health Initiatives

United Health Initiatives (UHI) is a health humanitarian organization operating under USAID and United Nations mandates, deploying medical and support personnel to crisis regions worldwide.

### Staff Categories

| Category | Description | Locations |
|----------|-------------|-----------|
| **Field Staff** | Deployed medical/non-medical personnel | Africa, Middle East, War-torn & Disaster-struck regions |
| **Non-Field Staff** | Office-based support personnel | Europe, Americas, Asia (USAID/UN control offices) |

### Personnel Types

**Medical Personnel:**

- Doctors / Physicians
- Nurses
- Lab Scientists
- Pharmacists
- Paramedics
- Medical Technicians

**Non-Medical Personnel:**

- Administrative Staff
- Logistics Coordinators
- Finance Officers
- HR Personnel
- IT Support
- Security Officers
- Translators/Interpreters

---

## 📋 Requirements Analysis

### ✅ Feasible Requirements

| # | Requirement | Feasibility | Implementation Effort |
|---|-------------|-------------|----------------------|
| 1 | Admin-only staff registration (no self-registration) | ✅ Fully feasible | Low - Remove registration route |
| 2 | Large passport photo display on dashboard | ✅ Fully feasible | Medium - UI redesign |
| 3 | Staff ID prominently displayed | ✅ Fully feasible | Low - Already exists |
| 4 | Bank account details (view-only for staff) | ✅ Fully feasible | Medium - New DB fields + UI |
| 5 | Field vs Non-Field staff distinction | ✅ Fully feasible | Medium - Schema + UI updates |
| 6 | Family member registration | ✅ Fully feasible | High - New module needed |
| 7 | Deployment history tracking | ✅ Fully feasible | High - New module needed |
| 8 | Loan invoice with bank details | ✅ Already exists | Low - Enhancement only |
| 9 | Admin-only profile editing | ✅ Fully feasible | Medium - Permission changes |
| 10 | ID card management | ✅ Fully feasible | Medium - Document system |

### ⚠️ Requirements Requiring Clarification

| # | Requirement | Concern | Recommendation |
|---|-------------|---------|----------------|
| 1 | Complete restriction on staff profile editing | May frustrate users | Allow contact info updates only |
| 2 | Multiple bank accounts | Complexity | Start with one primary account |

### ❌ Not Recommended

| # | Requirement | Reason | Alternative |
|---|-------------|--------|-------------|
| 1 | Storing full ID card images accessible to all | Security/Privacy risk | Store encrypted, admin-only access |
| 2 | Real-time deployment tracking | Complex infrastructure | Use deployment history instead |

---

## 🏗️ System Architecture Updates

### New Database Models Required

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENHANCED DATA MODEL                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                        │
│  │     User        │────▶│  StaffProfile   │                        │
│  │  (existing)     │     │   (extended)    │                        │
│  └────────┬────────┘     └─────────────────┘                        │
│           │                                                          │
│     ┌─────┴─────┬─────────────┬───────────────┐                     │
│     │           │             │               │                      │
│     ▼           ▼             ▼               ▼                      │
│  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐            │
│  │ Bank │  │ Family   │  │Deployment│  │ ID Documents │            │
│  │Account│  │ Members  │  │ History  │  │              │            │
│  └──────┘  └──────────┘  └──────────┘  └──────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Feature Modules

### Module 1: Extended Staff Profile

**Priority:** 🔴 Critical  
**Effort:** 16-20 hours

#### New Fields Required

```typescript
interface ExtendedStaffProfile {
  // Personal
  passportPhotoUrl: string;      // Large format photo
  dateOfBirth: Date;
  nationality: string;
  bloodType: string;
  
  // Staff Classification
  staffType: 'field' | 'non_field';
  specialization: string;        // e.g., "Emergency Medicine"
  qualifications: string[];      // Medical licenses, certifications
  
  // Contact
  personalPhone: string;
  workPhone: string;
  permanentAddress: string;
  currentAddress: string;
  
  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}
```

### Module 2: Bank Account Management

**Priority:** 🔴 Critical  
**Effort:** 8-10 hours

#### Features

- Store bank account details per staff
- View-only access for staff members
- Admin can add/edit/delete
- Support multiple currencies (USD, EUR, etc.)
- Used in payroll and loan invoices

#### Schema

```typescript
interface BankAccount {
  id: string;
  userId: string;
  isPrimary: boolean;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;        // Encrypted
  routingNumber: string;        // Encrypted
  swiftCode: string;
  iban?: string;                // For international
  currency: string;             // USD, EUR, GBP, etc.
  bankAddress: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;            // Admin who last modified
}
```

### Module 3: Family Members Registry

**Priority:** 🟡 High  
**Effort:** 12-16 hours

#### Features

- Track spouse, children, dependents
- Used for benefits, insurance, emergency contact
- Admin-managed, staff view-only

#### Schema

```typescript
interface FamilyMember {
  id: string;
  userId: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  isDependent: boolean;
  isEmergencyContact: boolean;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}
```

### Module 4: Deployment History

**Priority:** 🟡 High  
**Effort:** 16-20 hours

#### Features

- Track all deployments (past and current)
- Location (country, region, city)
- Duration and dates
- Role during deployment
- Supervisor information
- Mission/Project name

#### Schema

```typescript
interface Deployment {
  id: string;
  userId: string;
  missionName: string;           // e.g., "Syria Emergency Response"
  projectCode: string;           // Internal project code
  country: string;
  region: string;
  city?: string;
  startDate: Date;
  endDate?: Date;                // null = ongoing
  status: 'active' | 'completed' | 'cancelled';
  role: string;                  // Role during this deployment
  supervisorId?: string;
  hardshipLevel: 'A' | 'B' | 'C' | 'D' | 'E';  // UN hardship classification
  dangerPay: boolean;
  notes?: string;
}
```

### Module 5: ID Card & Document Management

**Priority:** 🟡 High  
**Effort:** 10-14 hours

#### Features

- Store copies of ID documents
- Track expiration dates
- Automated expiry alerts
- Support multiple document types

#### Document Types

- National ID / Passport
- Medical License
- Driver's License
- Work Permit
- UN Laissez-Passer
- USAID Badge
- Professional Certifications

#### Schema

```typescript
interface StaffDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentNumber: string;
  issuingCountry: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl: string;              // Encrypted storage
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
}
```

---

## 🎨 UI/UX Enhancements

### Dashboard Redesign

#### Current State

- Small profile section in sidebar
- Focus on quick links and widgets

#### Proposed Changes

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: United Health Initiatives Staff Portal                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐ │
│  │                            │  │  STAFF INFORMATION              │ │
│  │                            │  │                                 │ │
│  │    ┌──────────────────┐    │  │  Name: Dr. John Smith          │ │
│  │    │                  │    │  │  Staff ID: UHI-2024-00142      │ │
│  │    │   PASSPORT       │    │  │  Position: Field Physician     │ │
│  │    │   PHOTO          │    │  │  Type: FIELD STAFF             │ │
│  │    │   (200x250px)    │    │  │  Department: Medical Services  │ │
│  │    │                  │    │  │                                 │ │
│  │    └──────────────────┘    │  │  Current Deployment:           │ │
│  │                            │  │  🌍 Syria - Damascus Region     │ │
│  │    UHI-2024-00142         │  │  Mission: Emergency Response    │ │
│  │    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄    │  │  Since: Oct 15, 2025           │ │
│  │    (QR Code or Barcode)   │  │                                 │ │
│  └────────────────────────────┘  └────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  BANK ACCOUNT (View Only)                                      │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │  Bank: First National Bank            Account: ****4567        │ │
│  │  Currency: USD                         SWIFT: FNBKUS33XXX      │ │
│  │  ⓘ Contact HR to update bank details                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │ 📅 Leave     │  │ 💰 Finance   │  │ 📋 Apps      │  │ 👨‍👩‍👧 Family ││
│  │ Balance: 14  │  │ Salary: OK   │  │ Pending: 2   │  │ Members:3││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Profile Photo Component Specifications

| Property | Value |
|----------|-------|
| Container Size | 220px × 280px |
| Image Aspect Ratio | 3:4 (passport standard) |
| Border | 3px solid #1a365d |
| Border Radius | 8px |
| Shadow | 0 4px 20px rgba(0,0,0,0.15) |
| Background | White with subtle pattern |
| Fallback | Placeholder with initials |

### Color Scheme (Humanitarian Theme)

```css
:root {
  /* Primary - USAID Blue */
  --uhi-primary: #002F6C;
  --uhi-primary-light: #0067B9;
  
  /* Accent - UN Blue */
  --uhi-accent: #009EDB;
  
  /* Humanitarian Red */
  --uhi-alert: #C8102E;
  
  /* Success - Field Green */
  --uhi-success: #3D8B40;
  
  /* Neutrals */
  --uhi-dark: #1A1A2E;
  --uhi-gray: #4A4A5E;
  --uhi-light: #F5F5F7;
  
  /* Status Colors */
  --status-deployed: #E65100;
  --status-office: #1976D2;
  --status-leave: #7B1FA2;
}
```

---

## 🔐 Permission Model Updates

### Current Roles

| Role | Permissions |
|------|-------------|
| admin | Full access |
| hr_manager | Staff management |
| finance | Payroll, loans |
| supervisor | Team view |
| staff | Self-service (limited) |

### Updated Permissions Matrix

| Action | Staff | Supervisor | HR | Finance | Admin |
|--------|-------|------------|-----|---------|-------|
| **View own profile** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit own contact info** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit own profile data** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View own bank account** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit bank account** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **View own family** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit family members** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **View deployment history** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage deployments** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Create new staff** | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Process payroll** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Manage loans** | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 📅 Implementation Phases

### Phase 1: Foundation Fixes (Week 1)

**Goal:** Get the system building and running

| Task | Priority | Hours |
|------|----------|-------|
| Fix all TypeScript errors | 🔴 | 4 |
| Install missing dependencies | 🔴 | 1 |
| Regenerate Prisma client | 🔴 | 1 |
| Disable self-registration | 🔴 | 2 |
| Security hardening | 🔴 | 4 |

**Deliverable:** Clean build, secure baseline

### Phase 2: Schema Extensions (Week 2)

**Goal:** Add new data models

| Task | Priority | Hours |
|------|----------|-------|
| Extended Staff Profile | 🔴 | 6 |
| Bank Account model | 🔴 | 4 |
| Family Members model | 🟡 | 6 |
| Deployment History model | 🟡 | 6 |
| ID Documents model | 🟡 | 4 |
| Run migrations | 🔴 | 2 |
| Update seed data | 🟡 | 4 |

**Deliverable:** Complete database schema

### Phase 3: Backend API (Week 3-4)

**Goal:** Implement all new endpoints

| Module | Endpoints | Hours |
|--------|-----------|-------|
| Extended Profile | GET, PUT (admin) | 8 |
| Bank Accounts | CRUD (admin), GET (staff) | 10 |
| Family Members | CRUD (admin), GET (staff) | 10 |
| Deployments | CRUD (admin), GET (staff) | 12 |
| Documents | CRUD (admin), GET (staff) | 10 |

**Deliverable:** Complete REST API

### Phase 4: Frontend - Dashboard (Week 5)

**Goal:** Redesigned dashboard with photo

| Task | Hours |
|------|-------|
| Dashboard layout redesign | 8 |
| Large passport photo component | 6 |
| Staff info card | 4 |
| Bank account display | 4 |
| Deployment status widget | 4 |
| CSS theming to UHI colors | 6 |

**Deliverable:** New dashboard experience

### Phase 5: Admin Interface (Week 6-7)

**Goal:** Complete admin management

| Page | Features | Hours |
|------|----------|-------|
| Staff Registration Form | Full registration | 12 |
| Staff Profile Editor | All editable fields | 10 |
| Bank Account Manager | CRUD + validation | 8 |
| Family Registry | CRUD + relations | 10 |
| Deployment Manager | CRUD + status | 10 |
| Document Vault | Upload + verify | 10 |

**Deliverable:** Full admin capabilities

### Phase 6: Testing & Polish (Week 8)

| Task | Hours |
|------|-------|
| Unit tests for new modules | 16 |
| Integration tests | 12 |
| UI testing | 8 |
| Performance optimization | 8 |
| Documentation | 8 |

**Deliverable:** Production-ready system

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Build Status | 0 errors |
| Test Coverage | > 80% |
| API Response Time | < 200ms |
| Page Load Time | < 2s |
| Accessibility Score | > 90 |
| Security Audit | Pass |

---

## 📝 Next Steps

1. **Immediate:** Review and approve this plan
2. **Day 1-2:** Implement critical fixes
3. **Week 1:** Complete Phase 1
4. **Week 2:** Begin Phase 2 (Schema)
5. **Ongoing:** Weekly progress reviews

---

*Prepared for United Health Initiatives*  
*Document Version: 1.0*
