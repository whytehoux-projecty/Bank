# 📋 UHI Staff Portal - Requirements Analysis Summary

**Organization:** United Health Initiatives  
**Date:** January 10, 2026

---

## User Requirements Summary

This document summarizes the analysis of all user requirements with feasibility assessments and recommendations.

---

## ✅ APPROVED: Feasible Requirements

### 1. Admin-Only Staff Registration

**Requirement:** Staff cannot self-register. Only admin can create new staff accounts.

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- Remove `/auth/register` endpoint from public routes
- Create `/admin/staff` POST endpoint for staff creation
- Admin dashboard form for staff onboarding

**Recommendation:** ✅ APPROVED - Implement as requested

---

### 2. Large Passport Photo on Dashboard

**Requirement:** Display a prominent passport photo of the staff on the dashboard, visible "to anybody that opens the dashboard page."

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- Staff ID Card component with 220x280px photo container
- 3:4 aspect ratio (passport standard)
- Prominent placement at top of dashboard
- Fallback placeholder with initials if no photo

**Recommendation:** ✅ APPROVED - See DASHBOARD_UI_SPECIFICATION.md

---

### 3. Staff ID Prominently Displayed

**Requirement:** Staff ID should be clearly visible alongside the photo.

**Feasibility:** ✅ Already Partially Exists

**Enhancement:**

- Larger font size for Staff ID
- Add barcode/QR code for scanning
- Position below photo in ID card format

**Recommendation:** ✅ APPROVED - Minor enhancement needed

---

### 4. View-Only Bank Account Details

**Requirement:** Staff can view their bank account but cannot edit/change it.

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- New `bank_accounts` table in database
- `GET /staff/bank-accounts` returns masked account numbers
- Display in dark-themed card on dashboard
- "Contact HR to update" notice included

**Recommendation:** ✅ APPROVED - See ENHANCED_DATABASE_SCHEMA.md

---

### 5. Field vs Non-Field Staff Distinction

**Requirement:** Differentiate between field staff (deployed to crisis regions) and non-field staff (office-based).

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- Add `staff_type` enum to `StaffProfile` model
- Visual badge on ID card and profile
- Filter capability in admin interface
- Different dashboard widgets per type

**Field Staff Specific:**

- Current deployment display
- R&R leave balance
- Hardship/danger pay indicators

**Non-Field Staff Specific:**

- Office location display
- Standard leave balance

**Recommendation:** ✅ APPROVED - Core feature for UHI

---

### 6. Family Members Registration (Admin-Managed)

**Requirement:** Admin registers staff family members. Staff can view but not edit.

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- New `family_members` table
- Support for: spouse, children, parents, siblings
- Track: name, DOB, relationship, contact info
- Beneficiary percentage for insurance
- Emergency contact designation

**Recommendation:** ✅ APPROVED - Important for HR and benefits

---

### 7. Deployment History Tracking

**Requirement:** Track where field staff have been deployed and current deployment status.

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- New `deployments` table
- Track: mission, location, dates, role
- UN hardship classification (A-E)
- Danger pay and R&R eligibility
- Current vs historical deployments

**Recommendation:** ✅ APPROVED - Critical for field operations

---

### 8. Loan Invoice with Bank Details

**Requirement:** When generating loan repayment invoices, include payment bank details.

**Feasibility:** ✅ Already Partially Exists

**Enhancement:**

- Include organization's bank details for receiving payments
- Add staff's bank details for reference
- Generate PDF invoice

**Recommendation:** ✅ APPROVED - Enhancement to existing feature

---

### 9. ID Card/Document Management

**Requirement:** Store and manage staff ID cards and other documents.

**Feasibility:** ✅ Fully Feasible

**Implementation:**

- New `staff_documents` table
- Support multiple document types (passport, license, etc.)
- Expiry date tracking with alerts
- Verification workflow
- Secure encrypted storage

**Recommendation:** ✅ APPROVED - Critical for compliance

---

## ⚠️ MODIFIED: Requirements Needing Adjustment

### 10. Complete Restriction on Profile Editing

**Original Requirement:** Staff cannot edit ANY profile information.

**Concern:** May frustrate users who need to update contact info.

**Recommendation:** ⚠️ MODIFY

**Proposed Approach:**

| Field Category | Staff Can Edit? |
|----------------|-----------------|
| Core Identity (Name, DOB, Nationality) | ❌ No |
| Staff Classification | ❌ No |
| Employment Details | ❌ No |
| Bank Account | ❌ No |
| Personal Phone | ✅ Yes |
| Personal Email | ✅ Yes |
| Current Address | ✅ Yes |
| Emergency Contact | ✅ Yes |
| Password | ✅ Yes |

**Rationale:** Allow non-sensitive contact updates while protecting official records.

---

## ❌ NOT RECOMMENDED

### 11. Storing Full ID Card Images Visible to All

**Original Concern:** Storing ID cards that all staff can view.

**Why Not Recommended:**

- Privacy risk (ID numbers, photos, DOB exposed)
- GDPR/data protection violations
- Identity theft potential

**Alternative Implementation:**

- Staff can see their OWN documents only
- Documents stored encrypted on S3
- Signed URLs with short expiry for downloads
- Admin-only access to verify others' documents
- Audit logging of all document access

**Recommendation:** ❌ REJECTED as originally conceived, ✅ APPROVED with access controls

---

### 12. Real-Time GPS Deployment Tracking

**Not Explicitly Requested, But Considered**

**Why Not Recommended:**

- Privacy concerns for staff
- Complex infrastructure needed
- Battery drain on devices
- Security risks in conflict zones

**Alternative:**

- Deployment check-in system (voluntary)
- Security incident reporting
- Regular status updates to supervisors

**Recommendation:** ❌ NOT RECOMMENDED - Use deployment history instead

---

## 📊 Requirements Priority Matrix

| # | Requirement | Feasible | Priority | Effort | Phase |
|---|-------------|----------|----------|--------|-------|
| 1 | Admin-only registration | ✅ | 🔴 Critical | 4h | 1 |
| 2 | Large passport photo | ✅ | 🔴 Critical | 8h | 2 |
| 3 | Staff ID display | ✅ | 🔴 Critical | 2h | 2 |
| 4 | Bank account (view-only) | ✅ | 🔴 Critical | 12h | 2 |
| 5 | Field/Non-field distinction | ✅ | 🔴 Critical | 8h | 2 |
| 6 | Family members | ✅ | 🟡 High | 16h | 3 |
| 7 | Deployment history | ✅ | 🟡 High | 16h | 3 |
| 8 | Loan invoice enhancement | ✅ | 🟡 High | 4h | 2 |
| 9 | Document management | ✅ | 🟡 High | 20h | 3 |
| 10 | Limited profile editing | ✅ | 🟡 High | 8h | 2 |

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)

- Fix critical bugs
- Disable self-registration
- Security hardening

### Phase 2: Core Features (Weeks 2-3)

- Extended staff profile
- Large photo component
- Bank account module
- Dashboard redesign
- Staff type classification

### Phase 3: Extended Features (Weeks 4-5)

- Family members module
- Deployment history
- Document management

### Phase 4: Polish (Week 6)

- Admin interface for all new features
- Testing
- Documentation

---

## Summary

| Category | Count |
|----------|-------|
| ✅ Fully Approved | 8 |
| ⚠️ Modified/Adjusted | 1 |
| ❌ Not Recommended | 2 |
| **Total Requirements** | **11** |

**Overall Assessment:** The user requirements are well-thought-out and aligned with the needs of a humanitarian organization. All major requirements can be implemented with reasonable effort.

---

*Requirements Analysis v1.0*  
*United Health Initiatives Staff Portal*
