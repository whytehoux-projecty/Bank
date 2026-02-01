# 🔒 Security Policy

This document outlines the security measures and compliance standards for the Staff Portal.

## 1. Authentication & Session Management
*   **Token Strategy**:
    *   **Access Token**: Short-lived (15 min) JWT stored in memory (frontend).
    *   **Refresh Token**: Long-lived (7 days) JWT stored in `httpOnly`, `secure`, `SameSite=Strict` cookie.
*   **Password Storage**:
    *   Passwords are **never** stored in plain text.
    *   Algorithm: `bcrypt` with work factor 12.
*   **Account Lockout**: Account temporarily locked after 5 failed attempts (prevent Brute Force).
*   **MFA**: Mandatory for Admin and Finance roles (TOTP via Google Authenticator).

## 2. Data Protection
*   **Encryption at Rest**:
    *   Database volume encryption (e.g., AWS EBS encryption).
    *   **Field-Level Encryption**: Sensitive PII (Passport Number, Bank Account) encrypted using AES-256-GCM before database insertion. Key managed via KMS (Vault/AWS KMS).
*   **Encryption in Transit**:
    *   All HTTP traffic forced over TLS 1.3 (HTTPS).
    *   HSTS header enabled (`max-age=31536000`).

## 3. Access Control (RBAC)
*   **Principle of Least Privilege**: Users are granted only the permissions necessary for their role.
*   **Role Definitions**:
    *   `ADMIN`: Full system access.
    *   `HR_MANAGER`: Can view/edit all staff, approve leaves.
    *   `FINANCE_OFFICER`: Can view/edit payroll and loans.
    *   `STAFF`: Can view own profile, submit applications.
*   **Enforcement**: Middleware checks permissions on every protected route.

## 4. Input Validation & Sanitization
*   **Validation**: All incoming data (Body, Query, Params) validated against strict schemas (Zod/Joi).
*   **Sanitization**: HTML tags stripped to prevent XSS.
*   **SQL Injection**: Use of ORM (Prisma) or Parameterized Queries strictly enforced.

## 5. Audit & Compliance
*   **Audit Logging**:
    *   Who (Actor ID)
    *   What (Action, e.g., `DELETE_USER`)
    *   When (Timestamp)
    *   Where (IP Address, User Agent)
*   **GDPR Compliance**:
    *   "Right to be Forgotten": Functionality to anonymize user data upon request.
    *   Data Export: Users can download their own data (JSON/PDF).

## 6. Infrastructure Security
*   **Rate Limiting**: `express-rate-limit` configured per IP (e.g., 100 req/15min) to prevent DDoS.
*   **Headers**: `Helmet.js` enabled to set security headers (CSP, X-Frame-Options, X-XSS-Protection).
*   **Docker**: Containers run as non-root users.
