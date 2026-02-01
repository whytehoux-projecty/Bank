# 🗄️ Database Schema Design

This document outlines the PostgreSQL database schema. We use a normalized relational model.

## 1. Entity Relationship Diagram (ERD) Overview

* **Users**: Central entity.
* **Roles**: Define permissions (Admin, HR, Staff, Supervisor).
* **Employment_History**: One-to-Many with Users.
* **Contracts**: One-to-Many with Users.
* **Payroll_Records**: One-to-Many with Users.
* **Loans**: One-to-Many with Users.
* **Applications**: One-to-Many with Users (Requester) and Users (Approver).

## 2. Table Definitions

### 2.1 Core Identity

**`users`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, Default: uuid_generate_v4() | Internal ID |
| staff_id | VARCHAR(20) | Unique, Not Null | Public facing ID (e.g., UN-001) |
| email | VARCHAR(255) | Unique, Not Null | Corporate email |
| password_hash | VARCHAR | Not Null | Bcrypt hash |
| first_name | VARCHAR(100) | Not Null | |
| last_name | VARCHAR(100) | Not Null | |
| avatar_url | VARCHAR | | URL to object storage |
| status | ENUM | 'active', 'inactive', 'suspended' | |
| created_at | TIMESTAMP | Default: NOW() | |

**`roles`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, Serial | |
| name | VARCHAR(50) | Unique, Not Null | 'admin', 'staff', 'hr_manager' |
| permissions | JSONB | Not Null | List of allowed actions |

**`user_roles`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | FK -> users.id | |
| role_id | INT | FK -> roles.id | |

### 2.2 Employment Module

**`departments`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, Serial | |
| name | VARCHAR(100) | Unique, Not Null | |
| location | VARCHAR(100) | | |

**`contracts`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| type | ENUM | 'fixed_term', 'service', 'permanent' | |
| start_date | DATE | Not Null | |
| end_date | DATE | | Null if permanent |
| document_url | VARCHAR | | S3 URL to signed PDF |
| status | ENUM | 'active', 'expired', 'terminated' | |

**`employment_history`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| position_title| VARCHAR(100) | Not Null | |
| department_id | INT | FK -> departments.id | |
| supervisor_id | UUID | FK -> users.id | |
| start_date | DATE | Not Null | |
| end_date | DATE | | |

### 2.3 Finance Module

**`payroll_records`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| period_month | INT | Not Null | 1-12 |
| period_year | INT | Not Null | 2024, etc. |
| basic_salary | DECIMAL | Not Null | |
| allowances | DECIMAL | Default 0 | |
| deductions | DECIMAL | Default 0 | |
| net_pay | DECIMAL | Not Null | |
| currency | VARCHAR(3) | Default 'USD' | |
| payment_date | DATE | | |
| status | ENUM | 'draft', 'processed', 'paid' | |

**`loans`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | |
| amount | DECIMAL | Not Null | |
| reason | TEXT | | |
| repayment_plan| JSONB | | Schedule details |
| balance | DECIMAL | Not Null | |
| status | ENUM | 'pending', 'approved', 'rejected', 'active', 'paid_off' | |

### 2.4 Applications Module

**`applications`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id | Applicant |
| type | ENUM | 'leave', 'transfer', 'training', 'loan' | |
| data | JSONB | Not Null | Flexible payload (dates, reason, etc.) |
| status | ENUM | 'pending', 'approved', 'rejected', 'cancelled' | |
| current_handler_id | UUID | FK -> users.id | Who needs to act next |
| created_at | TIMESTAMP | Default: NOW() | |

**`application_audit`** (History of actions)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| application_id| UUID | FK -> applications.id | |
| actor_id | UUID | FK -> users.id | Who performed action |
| action | VARCHAR(50) | 'submitted', 'approved', 'commented' | |
| comment | TEXT | | |
| timestamp | TIMESTAMP | Default: NOW() | |

### 2.5 System Configuration (Dynamic Branding)

**`system_settings`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| key | VARCHAR(50) | PK | e.g., 'org_logo_url', 'portal_name' |
| value | TEXT | Not Null | The value (image URL, text) |
| type | VARCHAR(20) | | 'string', 'boolean', 'image_url' |
| updated_by | UUID | FK -> users.id | Last admin who changed it |
| updated_at | TIMESTAMP | Default: NOW() | |

## 3. Indexes & Performance

* `users(staff_id)`: Hash index for fast login lookups.
* `applications(user_id, status)`: Composite B-tree for dashboard filtering.
* `payroll_records(period_year, period_month)`: For generating monthly reports.

## 4. Security Considerations

* **Row Level Security (RLS)**: Can be enabled in Postgres to ensure staff can only see their own rows in sensitive tables (payroll, loans).
* **Encryption**: `bank_account_details` (if stored) must be encrypted at application level before insertion.
