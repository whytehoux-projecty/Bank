# 🏗️ Backend Architecture Overview

## 1. System Context
The **Staff Portal Backend** serves as the central nervous system for the Global Staff Portal. It manages sensitive staff data, financial records, and operational workflows (leave, transfers, etc.) while ensuring strict security and role-based access control (RBAC) typical of international organizations (UN, GIZ, USAID).

## 2. Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Runtime** | Node.js (v20+ LTS) | Non-blocking I/O ideal for handling concurrent API requests; huge ecosystem. |
| **Framework** | Express.js | Minimalist, flexible web framework for building RESTful APIs. |
| **Language** | TypeScript | Strong typing for financial/employment data reliability and maintainability. |
| **Database** | PostgreSQL (v15+) | ACID compliance, strong relational data support, complex querying capabilities. |
| **ORM** | Prisma / TypeORM | Type-safe database access and migration management. |
| **Caching** | Redis | Session management, caching frequent data (e.g., config settings). |
| **Authentication** | JWT + Passport.js | Stateless authentication with support for MFA and potentially SSO (SAML/OIDC). |
| **File Storage** | AWS S3 / MinIO | Secure storage for staff documents (contracts, payslips). |
| **Containerization**| Docker | Consistent environments across dev, staging, and production. |

## 3. Architecture Pattern
We will follow a **Layered Architecture (Separation of Concerns)** to ensure modularity and testability.

```mermaid
graph TD
    Client[Frontend Client] -->|HTTP/JSON| LB[Load Balancer / Nginx]
    LB --> API[API Layer (Express Routes)]
    
    subgraph "Backend Service"
        API --> Auth[Auth Middleware]
        API --> Controllers[Controllers]
        Controllers --> Services[Business Logic Services]
        Services --> DAL[Data Access Layer / Repositories]
        DAL --> ORM[Prisma / ORM]
    end
    
    ORM --> DB[(PostgreSQL)]
    Services --> Cache[(Redis)]
    Services --> Storage[Object Storage]
```

### 3.1 Layers Description
1.  **Presentation Layer (API)**: Handles incoming HTTP requests, input validation (Zod/Joi), and routing.
2.  **Application Layer (Services)**: Contains the core business logic (e.g., "Calculate Payroll", "Approve Leave"). This layer is database-agnostic.
3.  **Data Access Layer (Repositories)**: Directly interacts with the database. Abstracts SQL queries.
4.  **Infrastructure Layer**: Integrations with external services (Email, S3, PDF Generation).

## 4. Key Microservices / Modules

1.  **Auth & Identity Module**
    *   User Management (Staff/Admin)
    *   Role Management (RBAC)
    *   MFA & Session Handling

2.  **Staff Management Module**
    *   Profile & Bio
    *   Employment History
    *   Contract Management

3.  **Finance Module**
    *   Payroll Processing
    *   Loan Management
    *   Benefits Administration

4.  **Workflow & Applications Module**
    *   Dynamic Form Submission
    *   Approval Workflows (State Machine)
    *   Notifications

5.  **Admin & Reporting Module**
    *   System Auditing
    *   Analytics Dashboard
    *   Bulk Operations

## 5. Security Architecture
*   **Transport Security**: TLS 1.3 for all communications.
*   **Data at Rest**: AES-256 encryption for sensitive DB columns (bank details, IDs).
*   **Authentication**: Short-lived JWTs (15min) + Refresh Tokens (7 days).
*   **Authorization**: Granular RBAC (e.g., `finance:read`, `application:approve`).
*   **Audit Logging**: Immutable logs for every state-changing action.

## 6. Scalability & Performance
*   **Horizontal Scaling**: Stateless API design allows adding more instances behind a load balancer.
*   **Database Read Replicas**: Separate read/write operations for reporting vs. transactional queries.
*   **Async Processing**: Use message queues (BullMQ/RabbitMQ) for heavy tasks like generating bulk payslips or email notifications.
