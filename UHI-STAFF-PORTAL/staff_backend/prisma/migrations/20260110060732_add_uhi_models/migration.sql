-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('fixed_term', 'service', 'permanent');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('active', 'expired', 'terminated');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('draft', 'processed', 'paid');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('pending', 'approved', 'rejected', 'active', 'paid_off');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('leave', 'transfer', 'training', 'loan');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed', 'domestic_partnership');

-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('field', 'non_field');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('checking', 'savings', 'current');

-- CreateEnum
CREATE TYPE "BankAccountPurpose" AS ENUM ('salary', 'reimbursement', 'loan_repayment', 'other');

-- CreateEnum
CREATE TYPE "FamilyRelationship" AS ENUM ('spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'in_law', 'guardian', 'other');

-- CreateEnum
CREATE TYPE "DeploymentType" AS ENUM ('standard', 'emergency', 'short_term', 'consultancy', 'training', 'detail');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('planned', 'active', 'completed', 'cancelled', 'extended');

-- CreateEnum
CREATE TYPE "HardshipLevel" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "SecurityLevel" AS ENUM ('minimal', 'low', 'intermediate', 'high', 'extreme');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('passport', 'national_id', 'drivers_license', 'medical_license', 'nursing_license', 'professional_cert', 'work_permit', 'visa', 'un_laissez_passer', 'usaid_badge', 'security_clearance', 'vaccination_record', 'contract', 'diploma', 'other');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "staff_id" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "avatar_url" VARCHAR,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "password_reset_token" VARCHAR,
    "password_reset_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "permissions" JSONB NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ContractType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "document_url" VARCHAR,
    "status" "ContractStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "position_title" VARCHAR(100) NOT NULL,
    "department_id" INTEGER NOT NULL,
    "supervisor_id" UUID,
    "start_date" DATE NOT NULL,
    "end_date" DATE,

    CONSTRAINT "employment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "basic_salary" DECIMAL NOT NULL,
    "allowances" DECIMAL NOT NULL DEFAULT 0,
    "allowance_details" JSONB,
    "deductions" DECIMAL NOT NULL DEFAULT 0,
    "deduction_details" JSONB,
    "net_pay" DECIMAL NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "payment_date" DATE,
    "status" "PayrollStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL NOT NULL,
    "balance" DECIMAL NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "reason" TEXT,
    "repayment_plan" JSONB,
    "repayment_months" INTEGER,
    "monthly_payment" DECIMAL,
    "interest_rate" DECIMAL,
    "status" "LoanStatus" NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "last_payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "rejected_by" UUID,
    "rejection_reason" TEXT,
    "admin_notes" TEXT,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_payments" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "amount" DECIMAL NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "confirmed_by" UUID,

    CONSTRAINT "loan_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "data" JSONB NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "current_handler_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_audit" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "comment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_settings" (
    "id" SERIAL NOT NULL,
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "setting_type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "passport_photo_url" VARCHAR(500),
    "date_of_birth" DATE,
    "place_of_birth" VARCHAR(100),
    "nationality" VARCHAR(50),
    "secondary_nationality" VARCHAR(50),
    "blood_type" "BloodType",
    "gender" "Gender",
    "marital_status" "MaritalStatus",
    "staff_type" "StaffType" NOT NULL DEFAULT 'non_field',
    "specialization" VARCHAR(100),
    "qualifications" JSONB,
    "languages" JSONB,
    "personal_email" VARCHAR(255),
    "personal_phone" VARCHAR(30),
    "work_phone" VARCHAR(30),
    "whatsapp_number" VARCHAR(30),
    "permanent_address" TEXT,
    "permanent_city" VARCHAR(100),
    "permanent_country" VARCHAR(100),
    "current_address" TEXT,
    "current_city" VARCHAR(100),
    "current_country" VARCHAR(100),
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(30),
    "emergency_contact_relation" VARCHAR(50),
    "emergency_contact_address" TEXT,
    "medical_conditions" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "account_holder_name" VARCHAR(200) NOT NULL,
    "bank_name" VARCHAR(200) NOT NULL,
    "bank_branch" VARCHAR(200),
    "account_number" VARCHAR(50) NOT NULL,
    "routing_number" VARCHAR(50),
    "swift_code" VARCHAR(20),
    "iban" VARCHAR(50),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "bank_address" TEXT,
    "bank_city" VARCHAR(100),
    "bank_country" VARCHAR(100),
    "account_type" "BankAccountType" NOT NULL DEFAULT 'checking',
    "account_purpose" "BankAccountPurpose" NOT NULL DEFAULT 'salary',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "relationship" "FamilyRelationship" NOT NULL,
    "date_of_birth" DATE,
    "gender" "Gender",
    "nationality" VARCHAR(50),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "address" TEXT,
    "is_dependent" BOOLEAN NOT NULL DEFAULT false,
    "is_emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_beneficiary" BOOLEAN NOT NULL DEFAULT false,
    "beneficiary_percentage" DECIMAL(5,2),
    "id_document_url" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mission_name" VARCHAR(200) NOT NULL,
    "mission_code" VARCHAR(50),
    "project_name" VARCHAR(200),
    "project_code" VARCHAR(50),
    "country" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "city" VARCHAR(100),
    "duty_station" VARCHAR(100),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "expected_end_date" DATE,
    "deployment_role" VARCHAR(100) NOT NULL,
    "reporting_to" VARCHAR(100),
    "supervisor_id" UUID,
    "deployment_type" "DeploymentType" NOT NULL DEFAULT 'standard',
    "status" "DeploymentStatus" NOT NULL DEFAULT 'active',
    "hardship_level" "HardshipLevel",
    "danger_pay_eligible" BOOLEAN NOT NULL DEFAULT false,
    "r_and_r_eligible" BOOLEAN NOT NULL DEFAULT false,
    "security_level" "SecurityLevel",
    "contract_type" VARCHAR(50),
    "per_diem_rate" DECIMAL(10,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "deployment_letter_url" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_name" VARCHAR(200) NOT NULL,
    "document_number" VARCHAR(100),
    "issuing_authority" VARCHAR(200),
    "issuing_country" VARCHAR(100),
    "issue_date" DATE,
    "expiry_date" DATE,
    "file_url" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_size" INTEGER,
    "file_type" VARCHAR(50),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "uploaded_by" UUID NOT NULL,

    CONSTRAINT "staff_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "annual_total" INTEGER NOT NULL DEFAULT 21,
    "annual_used" INTEGER NOT NULL DEFAULT 0,
    "annual_pending" INTEGER NOT NULL DEFAULT 0,
    "annual_carried_over" INTEGER NOT NULL DEFAULT 0,
    "sick_total" INTEGER NOT NULL DEFAULT 15,
    "sick_used" INTEGER NOT NULL DEFAULT 0,
    "maternity_total" INTEGER NOT NULL DEFAULT 90,
    "maternity_used" INTEGER NOT NULL DEFAULT 0,
    "paternity_total" INTEGER NOT NULL DEFAULT 14,
    "paternity_used" INTEGER NOT NULL DEFAULT 0,
    "compassionate_total" INTEGER NOT NULL DEFAULT 5,
    "compassionate_used" INTEGER NOT NULL DEFAULT 0,
    "study_total" INTEGER NOT NULL DEFAULT 10,
    "study_used" INTEGER NOT NULL DEFAULT 0,
    "rr_total" INTEGER NOT NULL DEFAULT 0,
    "rr_used" INTEGER NOT NULL DEFAULT 0,
    "unpaid_days_taken" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_accrued_at" TIMESTAMP(3),

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_staff_id_key" ON "users"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_staff_id_idx" ON "users"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE INDEX "payroll_records_period_year_period_month_idx" ON "payroll_records"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "loans_user_id_status_idx" ON "loans"("user_id", "status");

-- CreateIndex
CREATE INDEX "loan_payments_loan_id_idx" ON "loan_payments"("loan_id");

-- CreateIndex
CREATE INDEX "applications_user_id_status_idx" ON "applications"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cms_settings_setting_key_key" ON "cms_settings"("setting_key");

-- CreateIndex
CREATE INDEX "cms_settings_category_idx" ON "cms_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts"("user_id");

-- CreateIndex
CREATE INDEX "family_members_user_id_idx" ON "family_members"("user_id");

-- CreateIndex
CREATE INDEX "deployments_user_id_status_idx" ON "deployments"("user_id", "status");

-- CreateIndex
CREATE INDEX "staff_documents_user_id_document_type_idx" ON "staff_documents"("user_id", "document_type");

-- CreateIndex
CREATE INDEX "staff_documents_expiry_date_idx" ON "staff_documents"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_user_id_year_key" ON "leave_balances"("user_id", "year");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_payments" ADD CONSTRAINT "loan_payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_current_handler_id_fkey" FOREIGN KEY ("current_handler_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_audit" ADD CONSTRAINT "application_audit_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_audit" ADD CONSTRAINT "application_audit_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_settings" ADD CONSTRAINT "cms_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_documents" ADD CONSTRAINT "staff_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
