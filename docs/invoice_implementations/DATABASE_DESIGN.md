# Database Design: Invoice-Based Loan Repayment

This document details the database schema designs and changes required for the Staff Portal and E-Bank Portal to support the Invoice-Based Loan Repayment feature.

## 1. Overview

The goal is to enable Staff Members to repay their loans using invoices generated in the Staff Portal, which can then be paid through the AurumVault E-Banking Portal.

**Key Requirements:**

* **Grant Management**: Non-repayable grants.
* **Loan Management**: Repayable loans with interest and multiple repayments.
* **Invoice Generation**: Persistent invoices with validation data (PIN, Invoice #).
* **Cross-Portal Synchronization**: Tracking payment status between systems.

---

## 2. Staff Portal Schema Design

**Target Database**: PostgreSQL
**ORM**: Prisma
**Updates**: New `Grant` model, updated `Loan` relations, new `LoanInvoice` model.

### 2.1 New `Grant` Model

Grants are disjoint from loans as they are non-repayable but tracked financially.

```prisma
model Grant {
  id              String      @id @default(uuid()) @db.Uuid
  user_id         String      @db.Uuid
  amount          Decimal     @db.Decimal
  currency        String      @default("USD") @db.VarChar(10)
  reason          String      @db.Text
  category        String      @db.VarChar(50) // e.g., "Education", "Medical"
  status          GrantStatus @default(pending)
  
  // Admin Tracking
  approved_by     String?     @db.Uuid
  approved_at     DateTime?
  rejected_by     String?     @db.Uuid
  rejection_reason String?    @db.Text

  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  user            User        @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@map("grants")
}

enum GrantStatus {
  pending
  approved
  rejected
  disbursed
}
```

### 2.2 Updated `Loan` Model

No major schema changes needed to the core `Loan` model, but we need to ensure the `payments` relation captures the new invoice-based payments properly.

### 2.3 New `LoanInvoice` Model

This is critical for the "Invoice Persistence" requirement. It stores the details needed for the bank to validate a payment request.

```prisma
model LoanInvoice {
  id              String        @id @default(uuid()) @db.Uuid
  loan_id         String        @db.Uuid
  invoice_number  String        @unique @db.VarChar(50) // e.g INV-2026-XXXX
  payment_pin     String        @db.VarChar(20)         // Secret PIN for validation
  amount          Decimal       @db.Decimal
  currency        String        @default("USD") @db.VarChar(10)
  due_date        DateTime      @db.Date
  status          InvoiceStatus @default(pending)
  
  // Metadata for the invoice PDF/UI
  generated_by    String?       @db.Uuid // Admin or User ID
  generated_at    DateTime      @default(now())
  paid_at         DateTime?
  payment_transaction_ref String? @db.VarChar(100) // Reference from Main Bank

  loan            Loan          @relation(fields: [loan_id], references: [id], onDelete: Cascade)

  @@index([invoice_number])
  @@index([loan_id])
  @@map("loan_invoices")
}

enum InvoiceStatus {
  pending
  paid
  expired
  cancelled
}
```

---

## 3. E-Bank Portal Schema Design

**Target Database**: PostgreSQL
**ORM**: Prisma
**Updates**: `BillPayee` enhancement (optional), `InvoicePayment` tracking.

### 3.1 `InvoiceVerification` Model

Or we can treat this as a specialized Transaction metadata, but a dedicated model helps with the "verification documents" requirement (e.g. if manual upload is needed for large amounts, or just tracking the API sync status).

```prisma
// Linking specific bill payments to external invoices
model ExternalInvoicePayment {
  id                  String   @id @default(cuid())
  transactionId       String   @unique @map("transaction_id")
  externalSystem      String   @default("UHI_STAFF_PORTAL") @map("external_system")
  invoiceNumber       String   @map("invoice_number")
  verificationStatus  String   @default("VERIFIED") // VERIFIED, PENDING_MANUAL_REVIEW
  
  // For manual uploads if threshold exceeded
  documentPath        String?  @map("document_path")
  
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  transaction         Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@map("external_invoice_payments")
}
```

### 3.2 Updates to `Transaction` (Implicit)

We will likely add a `category` or `type` enum value `'INVOICE_PAYMENT'` to the existing `Transaction` model if it's not a free text field. (Existing schema says `type` is String, so we are good).

---

## 4. Migration Scripts

### 4.1 Staff Portal Migration

Save this as `prisma/migrations/20260121_add_invoices_grants/migration.sql` (conceptually):

```sql
-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('pending', 'approved', 'rejected', 'disbursed');
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'expired', 'cancelled');

-- CreateTable
CREATE TABLE "grants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "reason" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "status" "GrantStatus" NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "rejected_by" UUID,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_invoices" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "payment_pin" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "due_date" DATE NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "generated_by" UUID,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "payment_transaction_ref" VARCHAR(100),

    CONSTRAINT "loan_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grants_user_id_idx" ON "grants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_invoices_invoice_number_key" ON "loan_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "loan_invoices_loan_id_idx" ON "loan_invoices"("loan_id");

-- AddForeignKey
ALTER TABLE "grants" ADD CONSTRAINT "grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_invoices" ADD CONSTRAINT "loan_invoices_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### 4.2 E-Bank Portal Migration

Save this as `prisma/migrations/20260121_add_external_invoices/migration.sql` (conceptually):

```sql
-- CreateTable
CREATE TABLE "external_invoice_payments" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "external_system" TEXT NOT NULL DEFAULT 'UHI_STAFF_PORTAL',
    "invoice_number" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "document_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_invoice_payments_transaction_id_key" ON "external_invoice_payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "external_invoice_payments" ADD CONSTRAINT "external_invoice_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 5. Sample Data

### 5.1 Staff Portal - Loan Invoice

```json
{
  "id": "inv-uuid-1",
  "loan_id": "loan-uuid-123",
  "invoice_number": "UHI-INV-2026-001",
  "payment_pin": "HK92-LP99",
  "amount": 500.00,
  "currency": "USD",
  "due_date": "2026-02-01T00:00:00Z",
  "status": "pending",
  "generated_at": "2026-01-21T10:00:00Z"
}
```

### 5.2 E-Bank Portal - Payment Record

```json
{
  "transaction": {
    "id": "tx-uuid-789",
    "amount": -500.00,
    "type": "INVOICE_PAYMENT",
    "reference": "PAY-UHI-INV-2026-001",
    "status": "COMPLETED"
  },
  "externalInvoicePayment": {
    "transactionId": "tx-uuid-789",
    "externalSystem": "UHI_STAFF_PORTAL",
    "invoiceNumber": "UHI-INV-2026-001",
    "verificationStatus": "VERIFIED"
  }
}
```
