# 📊 Enhanced Database Schema for United Health Initiatives

**Version:** 2.0  
**Date:** January 10, 2026

---

## Overview

This document contains the enhanced Prisma schema additions for UHI Staff Portal.

---

## New Models

### 1. Extended Staff Profile (StaffProfile)

Add this to `prisma/schema.prisma`:

```prisma
model StaffProfile {
  id                      String    @id @default(uuid()) @db.Uuid
  user_id                 String    @unique @db.Uuid
  
  // Personal Information
  passport_photo_url      String?   @db.VarChar(500)
  date_of_birth           DateTime? @db.Date
  place_of_birth          String?   @db.VarChar(100)
  nationality             String?   @db.VarChar(50)
  secondary_nationality   String?   @db.VarChar(50)
  blood_type              BloodType?
  gender                  Gender?
  marital_status          MaritalStatus?
  
  // Staff Classification
  staff_type              StaffType @default(non_field)
  specialization          String?   @db.VarChar(100)
  qualifications          Json?     @db.JsonB    // Array of certifications/licenses
  languages               Json?     @db.JsonB    // Array of {language, proficiency}
  
  // Contact Information
  personal_email          String?   @db.VarChar(255)
  personal_phone          String?   @db.VarChar(30)
  work_phone              String?   @db.VarChar(30)
  whatsapp_number         String?   @db.VarChar(30)
  
  // Addresses
  permanent_address       String?   @db.Text
  permanent_city          String?   @db.VarChar(100)
  permanent_country       String?   @db.VarChar(100)
  current_address         String?   @db.Text
  current_city            String?   @db.VarChar(100)
  current_country         String?   @db.VarChar(100)
  
  // Emergency Contact
  emergency_contact_name      String?   @db.VarChar(100)
  emergency_contact_phone     String?   @db.VarChar(30)
  emergency_contact_relation  String?   @db.VarChar(50)
  emergency_contact_address   String?   @db.Text
  
  // Medical Information (optional, for field staff)
  medical_conditions      String?   @db.Text
  allergies               String?   @db.Text
  medications             String?   @db.Text
  
  // Metadata
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("staff_profiles")
}

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

enum MaritalStatus {
  single
  married
  divorced
  widowed
  domestic_partnership
}

enum StaffType {
  field
  non_field
}
```

---

### 2. Bank Account Model

```prisma
model BankAccount {
  id                    String    @id @default(uuid()) @db.Uuid
  user_id               String    @db.Uuid
  
  // Account Details
  is_primary            Boolean   @default(true)
  account_holder_name   String    @db.VarChar(200)
  bank_name             String    @db.VarChar(200)
  bank_branch           String?   @db.VarChar(200)
  account_number        String    @db.VarChar(50)    // Consider encryption
  routing_number        String?   @db.VarChar(50)
  swift_code            String?   @db.VarChar(20)
  iban                  String?   @db.VarChar(50)
  currency              String    @default("USD") @db.VarChar(10)
  
  // Bank Address
  bank_address          String?   @db.Text
  bank_city             String?   @db.VarChar(100)
  bank_country          String?   @db.VarChar(100)
  
  // Account Type
  account_type          BankAccountType @default(checking)
  account_purpose       BankAccountPurpose @default(salary)
  
  // Verification
  is_verified           Boolean   @default(false)
  verified_by           String?   @db.Uuid
  verified_at           DateTime?
  
  // Metadata
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  created_by            String    @db.Uuid
  updated_by            String?   @db.Uuid

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@map("bank_accounts")
}

enum BankAccountType {
  checking
  savings
  current
}

enum BankAccountPurpose {
  salary
  reimbursement
  loan_repayment
  other
}
```

---

### 3. Family Member Model

```prisma
model FamilyMember {
  id                    String    @id @default(uuid()) @db.Uuid
  user_id               String    @db.Uuid
  
  // Personal Details
  first_name            String    @db.VarChar(100)
  last_name             String    @db.VarChar(100)
  relationship          FamilyRelationship
  date_of_birth         DateTime? @db.Date
  gender                Gender?
  nationality           String?   @db.VarChar(50)
  
  // Contact
  phone                 String?   @db.VarChar(30)
  email                 String?   @db.VarChar(255)
  address               String?   @db.Text
  
  // Status
  is_dependent          Boolean   @default(false)
  is_emergency_contact  Boolean   @default(false)
  is_beneficiary        Boolean   @default(false)
  beneficiary_percentage Decimal?  @db.Decimal(5, 2)
  
  // Documents
  id_document_url       String?   @db.VarChar(500)
  
  // Notes
  notes                 String?   @db.Text
  
  // Metadata
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  created_by            String    @db.Uuid
  updated_by            String?   @db.Uuid

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@map("family_members")
}

enum FamilyRelationship {
  spouse
  child
  parent
  sibling
  grandparent
  grandchild
  in_law
  guardian
  other
}
```

---

### 4. Deployment History Model

```prisma
model Deployment {
  id                    String    @id @default(uuid()) @db.Uuid
  user_id               String    @db.Uuid
  
  // Mission Details
  mission_name          String    @db.VarChar(200)
  mission_code          String?   @db.VarChar(50)
  project_name          String?   @db.VarChar(200)
  project_code          String?   @db.VarChar(50)
  
  // Location
  country               String    @db.VarChar(100)
  region                String?   @db.VarChar(100)
  city                  String?   @db.VarChar(100)
  duty_station          String?   @db.VarChar(100)
  
  // Dates
  start_date            DateTime  @db.Date
  end_date              DateTime? @db.Date
  expected_end_date     DateTime? @db.Date
  
  // Position Details
  deployment_role       String    @db.VarChar(100)
  reporting_to          String?   @db.VarChar(100)
  supervisor_id         String?   @db.Uuid
  
  // Classification
  deployment_type       DeploymentType @default(standard)
  status                DeploymentStatus @default(active)
  
  // UN/USAID Specific
  hardship_level        HardshipLevel?
  danger_pay_eligible   Boolean   @default(false)
  r_and_r_eligible      Boolean   @default(false)  // Rest & Recuperation
  security_level        SecurityLevel?
  
  // Contract
  contract_type         String?   @db.VarChar(50)
  per_diem_rate         Decimal?  @db.Decimal(10, 2)
  currency              String    @default("USD") @db.VarChar(10)
  
  // Documentation
  deployment_letter_url String?   @db.VarChar(500)
  
  // Notes
  notes                 String?   @db.Text
  
  // Metadata
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  created_by            String    @db.Uuid
  updated_by            String?   @db.Uuid

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, status])
  @@map("deployments")
}

enum DeploymentType {
  standard
  emergency
  short_term
  consultancy
  training
  detail
}

enum DeploymentStatus {
  planned
  active
  completed
  cancelled
  extended
}

enum HardshipLevel {
  A    // No hardship
  B    // Minimal
  C    // Moderate
  D    // Substantial
  E    // Extreme
}

enum SecurityLevel {
  minimal
  low
  intermediate
  high
  extreme
}
```

---

### 5. Staff Document Model

```prisma
model StaffDocument {
  id                    String    @id @default(uuid()) @db.Uuid
  user_id               String    @db.Uuid
  
  // Document Info
  document_type         DocumentType
  document_name         String    @db.VarChar(200)
  document_number       String?   @db.VarChar(100)
  
  // Issuing Details
  issuing_authority     String?   @db.VarChar(200)
  issuing_country       String?   @db.VarChar(100)
  issue_date            DateTime? @db.Date
  expiry_date           DateTime? @db.Date
  
  // File
  file_url              String    @db.VarChar(500)
  file_name             String    @db.VarChar(255)
  file_size             Int?
  file_type             String?   @db.VarChar(50)
  
  // Verification
  verification_status   VerificationStatus @default(pending)
  verified_by           String?   @db.Uuid
  verified_at           DateTime?
  rejection_reason      String?   @db.Text
  
  // Status
  is_active             Boolean   @default(true)
  is_expired            Boolean   @default(false)
  
  // Notes
  notes                 String?   @db.Text
  
  // Metadata
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  uploaded_by           String    @db.Uuid

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, document_type])
  @@index([expiry_date])
  @@map("staff_documents")
}

enum DocumentType {
  passport
  national_id
  drivers_license
  medical_license
  nursing_license
  professional_cert
  work_permit
  visa
  un_laissez_passer
  usaid_badge
  security_clearance
  vaccination_record
  contract
  diploma
  other
}

enum VerificationStatus {
  pending
  verified
  rejected
  expired
}
```

---

### 6. Leave Balance Model

```prisma
model LeaveBalance {
  id                    String    @id @default(uuid()) @db.Uuid
  user_id               String    @db.Uuid
  year                  Int
  
  // Annual Leave
  annual_total          Int       @default(21)
  annual_used           Int       @default(0)
  annual_pending        Int       @default(0)
  annual_carried_over   Int       @default(0)
  
  // Sick Leave
  sick_total            Int       @default(15)
  sick_used             Int       @default(0)
  
  // Maternity/Paternity
  maternity_total       Int       @default(90)
  maternity_used        Int       @default(0)
  paternity_total       Int       @default(14)
  paternity_used        Int       @default(0)
  
  // Special Leave
  compassionate_total   Int       @default(5)
  compassionate_used    Int       @default(0)
  study_total           Int       @default(10)
  study_used            Int       @default(0)
  
  // R&R (Rest and Recuperation) - for field staff in hardship areas
  rr_total              Int       @default(0)
  rr_used               Int       @default(0)
  
  // Unpaid Leave Tracking
  unpaid_days_taken     Int       @default(0)
  
  // Metadata
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  last_accrued_at       DateTime?

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([user_id, year])
  @@map("leave_balances")
}
```

---

## Update User Model

Add these relations to the existing User model:

```prisma
model User {
  // ... existing fields ...
  
  // New Relations
  staff_profile       StaffProfile?
  bank_accounts       BankAccount[]
  family_members      FamilyMember[]
  deployments         Deployment[]
  staff_documents     StaffDocument[]
  leave_balances      LeaveBalance[]
  
  // ... existing relations ...
}
```

---

## Migration Commands

After updating the schema, run:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_uhi_models

# Seed database
npx prisma db seed
```

---

## Seed Data Updates

Update `prisma/seed.ts` to include:

1. Default leave balance for new users
2. Sample field/non-field staff profiles
3. Sample deployment data for testing
4. Sample bank account (masked for demo)

---

*Schema Version: 2.0*  
*For United Health Initiatives Staff Portal*
