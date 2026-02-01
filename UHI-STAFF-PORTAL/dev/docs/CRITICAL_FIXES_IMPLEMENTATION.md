# 🔧 Critical Fixes & Solutions Implementation Guide

**Organization:** United Health Initiatives (UHI)  
**Affiliation:** USAID / United Nations  
**Document Version:** 1.0  
**Date:** January 10, 2026  
**Status:** Implementation Ready

---

## 📋 Table of Contents

1. [Critical Build Fixes](#1-critical-build-fixes)
2. [Missing Type Definitions](#2-missing-type-definitions)
3. [Prisma Schema Synchronization](#3-prisma-schema-synchronization)
4. [Import Path Corrections](#4-import-path-corrections)
5. [Enum Value Fixes](#5-enum-value-fixes)
6. [Security Hardening](#6-security-hardening)
7. [Mock Data Replacement](#7-mock-data-replacement)

---

## 1. Critical Build Fixes

### 1.1 Install Missing Type Definitions

Run the following command to install missing TypeScript type definitions:

```bash
cd /Volumes/Project\ Disk/Project\ Built/Website_Projects/Staff\ Portal/backend
npm install --save-dev @types/nodemailer @types/pdfkit
```

### 1.2 Regenerate Prisma Client

After any schema changes, regenerate the Prisma client:

```bash
npx prisma generate
```

---

## 2. Missing Type Definitions

### 2.1 Fix: email.ts

**File:** `src/shared/utils/email.ts`

The nodemailer import should work after installing `@types/nodemailer`. No code change needed.

### 2.2 Fix: pdfGenerator.ts

**File:** `src/shared/utils/pdfGenerator.ts`

The pdfkit import should work after installing `@types/pdfkit`. No code change needed.

---

## 3. Prisma Schema Synchronization

### 3.1 Current Issue

The `loan.service.ts` references fields that may not be properly synced with the Prisma client.

### 3.2 Solution

Run the following commands in sequence:

```bash
# 1. Generate Prisma client from current schema
npx prisma generate

# 2. If database needs updating
npx prisma migrate dev --name sync_loan_fields

# 3. Seed the database with initial data
npx prisma db seed
```

---

## 4. Import Path Corrections

### 4.1 Fix: payroll.controller.ts (Line 3)

**Current (Incorrect):**

```typescript
import { AppError } from '../../shared/utils/AppError';
```

**Corrected:**

```typescript
import { AppError } from '../../shared/middleware/errorHandler.middleware';
```

### 4.2 Fix: payroll.service.ts (Line 2)

**Current (Incorrect):**

```typescript
import { AppError } from '../../shared/utils/AppError';
```

**Corrected:**

```typescript
import { AppError } from '../../shared/middleware/errorHandler.middleware';
```

### 4.3 Fix: payroll.service.ts (Line 3)

**Current (Incorrect):**

```typescript
import { sendEmail, payslipAvailableTemplate } from '../../shared/utils/email';
```

**Corrected:**

```typescript
import { sendEmail } from '../../shared/utils/email';
// Note: payslipAvailableTemplate should be imported from emailTemplates.ts
import { payslipAvailableTemplate } from '../../shared/utils/emailTemplates';
```

Or add the export to email.ts:

```typescript
// In email.ts, add this export
export { payslipAvailableTemplate } from './emailTemplates';
```

---

## 5. Enum Value Fixes

### 5.1 Fix: loan.service.ts - Status Values

The Prisma schema defines `LoanStatus` as:

```prisma
enum LoanStatus {
  pending
  approved
  rejected
  active
  paid_off  // NOT 'completed'
}
```

**Files to Update:** `src/modules/finance/loan.service.ts`

| Line | Current | Correct |
|------|---------|---------|
| 131 | `'completed'` | `'paid_off'` |
| 383 | `'completed'` | `'paid_off'` |
| 389 | `'completed'` | `'paid_off'` |
| 399 | `completed:` | `paidOff:` |

**Solution - Update loan.service.ts:**

```typescript
// Line 131: Change
status: newBalance <= 0 ? 'paid_off' : 'active',

// Line 383: Change  
prisma.loan.count({ where: { status: 'paid_off' } }),

// Line 389: Change
where: { status: { in: ['active', 'paid_off'] } },

// Line 396-402: Update return object
return {
    pending: pendingCount,
    active: activeCount,
    paidOff: completedCount,  // Renamed from 'completed'
    totalOutstanding: Number(totalOutstanding._sum?.balance || 0),
    totalDisbursed: Number(totalDisbursed._sum?.amount || 0),
    totalCollected,
};
```

### 5.2 Fix: loan.service.ts - UpdateLoanInput Interface

**Current (Line 23):**

```typescript
status?: LoanStatus;
```

The `LoanStatus` type should match Prisma's enum. Import it:

```typescript
import { LoanStatus } from '@prisma/client';
```

---

## 6. Security Hardening

### 6.1 Remove JWT Secret Fallback

**File:** `src/shared/utils/jwt.ts`

**Current (Insecure):**

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_me';
```

**Corrected (Secure):**

```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
```

### 6.2 Environment Variable Validation

Create a new file: `src/config/env.validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CORS_ORIGIN: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
});

export const validateEnv = () => {
    const result = envSchema.safeParse(process.env);
    
    if (!result.success) {
        console.error('❌ Environment validation failed:');
        console.error(result.error.format());
        process.exit(1);
    }
    
    return result.data;
};

export type Env = z.infer<typeof envSchema>;
```

### 6.3 Update server.ts

```typescript
import { validateEnv } from './config/env.validation';

// Validate environment before starting
validateEnv();

// ... rest of server code
```

---

## 7. Mock Data Replacement

### 7.1 Issue: Benefits Service Uses Random Data

**File:** `src/modules/finance/finance.service.ts` (Lines 96-116)

**Current (Mock):**

```typescript
leaveBalance: {
    annual: 21 - Math.floor(Math.random() * 10), // Mock: random days used
    sick: 15 - Math.floor(Math.random() * 5),
    maternity: 90,
    paternity: 14,
},
```

### 7.2 Solution: Create Benefits Table

**Step 1: Update Prisma Schema**

Add to `prisma/schema.prisma`:

```prisma
model LeaveBalance {
  id              String   @id @default(uuid()) @db.Uuid
  user_id         String   @unique @db.Uuid
  annual_total    Int      @default(21)
  annual_used     Int      @default(0)
  sick_total      Int      @default(15)
  sick_used       Int      @default(0)
  maternity_total Int      @default(90)
  maternity_used  Int      @default(0)
  paternity_total Int      @default(14)
  paternity_used  Int      @default(0)
  year            Int
  updated_at      DateTime @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, year])
  @@map("leave_balances")
}

model BenefitsPackage {
  id                    String  @id @default(uuid()) @db.Uuid
  user_id               String  @unique @db.Uuid
  insurance_type        String  @db.VarChar(100)
  insurance_coverage    String  @db.VarChar(50)
  insurance_provider    String  @db.VarChar(100)
  retirement_plan       String  @db.VarChar(100)
  employee_contribution Decimal @db.Decimal(5, 2)
  employer_match        Decimal @db.Decimal(5, 2)

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("benefits_packages")
}
```

**Step 2: Update User Model**

Add relations to User model:

```prisma
model User {
  // ... existing fields ...
  
  leave_balance    LeaveBalance?
  benefits_package BenefitsPackage?
}
```

**Step 3: Update Finance Service**

```typescript
async getBenefitsSummary(userId: string) {
    const [leaveBalance, benefits, user] = await Promise.all([
        prisma.leaveBalance.findUnique({
            where: { user_id: userId }
        }),
        prisma.benefitsPackage.findUnique({
            where: { user_id: userId }
        }),
        prisma.user.findUnique({
            where: { id: userId },
            include: {
                contracts: { where: { status: 'active' }, take: 1 },
            }
        })
    ]);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const yearsOfService = Math.floor(
        (Date.now() - user.created_at.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );

    return {
        leaveBalance: leaveBalance ? {
            annual: leaveBalance.annual_total - leaveBalance.annual_used,
            sick: leaveBalance.sick_total - leaveBalance.sick_used,
            maternity: leaveBalance.maternity_total - leaveBalance.maternity_used,
            paternity: leaveBalance.paternity_total - leaveBalance.paternity_used,
        } : null,
        insurance: benefits ? {
            type: benefits.insurance_type,
            coverage: benefits.insurance_coverage,
            provider: benefits.insurance_provider,
        } : null,
        retirement: benefits ? {
            plan: benefits.retirement_plan,
            employeeContribution: `${benefits.employee_contribution}%`,
            employerMatch: `${benefits.employer_match}%`,
        } : null,
        yearsOfService,
        contractType: user.contracts[0]?.type || 'N/A',
    };
}
```

---

## 📋 Implementation Checklist

### Immediate Actions (Day 1)

- [ ] Install missing type definitions
- [ ] Regenerate Prisma client
- [ ] Fix import paths in payroll files
- [ ] Fix enum values in loan.service.ts
- [ ] Remove JWT secret fallback

### Short-term Actions (Week 1)

- [ ] Add environment validation
- [ ] Create LeaveBalance table
- [ ] Create BenefitsPackage table
- [ ] Update finance service to use real data
- [ ] Run database migrations

### Verification Steps

```bash
# 1. Install dependencies
npm install --save-dev @types/nodemailer @types/pdfkit

# 2. Generate Prisma client
npx prisma generate

# 3. Run TypeScript build
npm run build

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

---

## 🎯 Expected Outcome

After implementing these fixes:

- ✅ TypeScript compilation: **0 errors**
- ✅ All imports resolved correctly
- ✅ Prisma types synchronized
- ✅ Security vulnerabilities addressed
- ✅ Mock data replaced with database queries

---

*Document prepared for United Health Initiatives Staff Portal*  
*Version 1.0 - January 10, 2026*
