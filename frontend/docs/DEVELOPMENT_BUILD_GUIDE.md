# Aurum Vault - Enterprise Banking Platform

## Complete Development & Deployment Guide

### 🎯 Project Overview

Aurum Vault represents the complete transformation of NovaBank into a luxury, enterprise-grade banking platform. This guide provides comprehensive instructions for building, developing, and deploying the multi-service architecture.

---

## 🏗️ Architecture Overview

### System Architecture

```text
AURUM VAULT ENTERPRISE ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│                  Frontend Application                       │
│  Next.js 15 + React 19 + Luxury Design System             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
│  Load Balancer + Rate Limiting + Authentication            │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│     Core Banking API    │    │   Admin Control Center │
│  Fastify + TypeScript   │    │  Express.js + EJS Views │
│  Port: 3001            │    │  Port: 3002            │
└─────────────────────────┘    └─────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│  PostgreSQL 15 + Redis 7 + Prisma ORM                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | Next.js | 15.x | Customer banking portal |
| **Frontend** | React | 19.x | UI components & state management |
| **API** | Fastify | 4.x | High-performance REST API |
| **Admin** | Express.js | 4.x | Admin control interface |
| **Database** | PostgreSQL | 15.x | Primary data store |
| **Cache** | Redis | 7.x | Session & performance cache |
| **ORM** | Prisma | 5.x | Database abstraction |
| **Auth** | Clerk | Latest | Authentication & user management |
| **Validation** | Zod | 3.x | Runtime type validation |
| **Containerization** | Docker | Latest | Service deployment |

---

## 🚀 Quick Start Guide

### Prerequisites

```bash
# Required software
- Node.js 18+ 
- npm 9+
- Docker & Docker Compose
- PostgreSQL 15+ (if running locally)
- Redis 7+ (if running locally)
```

### 1. Environment Setup

```bash
# Clone and navigate to project
cd /path/to/novabank

# Copy environment files
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your specific values
```

### 2. Backend Services Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies for all services
npm install

# Set up database
npm run db:migrate
npm run db:seed

# Start all services in development mode
npm run dev
```

### 3. Frontend Application Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Docker Deployment (Recommended)

```bash
# Navigate to backend directory
cd backend

# Start all services with Docker
npm run docker:up

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
npm run docker:down
```

---

## 📁 Project Structure

```text
novabank/
├── frontend/                    # Next.js 15 Customer Portal
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities & API clients
│   ├── styles/                 # Tailwind CSS & themes
│   └── public/                 # Static assets
├── backend/                    # Multi-Service Backend
│   ├── core-api/              # Fastify Banking API
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Auth, validation, logging
│   │   │   ├── models/        # Database models
│   │   │   └── utils/         # Utilities
│   │   ├── tests/             # API tests
│   │   └── docs/              # API documentation
│   ├── admin-interface/       # Express.js Admin Panel
│   │   ├── src/
│   │   │   ├── routes/        # Admin routes
│   │   │   ├── controllers/   # Admin controllers
│   │   │   ├── middleware/    # Admin auth & security
│   │   │   └── views/         # EJS templates
│   │   └── public/            # Admin static assets
│   ├── database/              # Database Management
│   │   ├── migrations/        # Prisma migrations
│   │   ├── seeds/             # Initial data
│   │   ├── schemas/           # Database schemas
│   │   └── procedures/        # Stored procedures
│   ├── shared/                # Shared Utilities
│   │   ├── types/             # TypeScript types
│   │   ├── constants/         # Shared constants
│   │   ├── validators/        # Data validation
│   │   └── utils/             # Common utilities
│   └── docker/                # Deployment Configs
│       ├── docker-compose.yml # Local development
│       ├── Dockerfile.api     # API container
│       └── Dockerfile.admin   # Admin container
└── docs/                      # Documentation
    ├── MASTER_IMPLEMENTATION_GUIDE.md
    ├── AURUM_DESIGN_SYSTEM.md
    ├── SECURITY_COMPLIANCE_IMPLEMENTATION.md
    └── [other documentation files]
```

---

## 🔧 Development Workflow

### Backend Development

```bash
# Start individual services
cd backend
npm run dev:api          # Start Core API only
npm run dev:admin        # Start Admin Interface only
npm run dev              # Start all services

# Database operations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
npm run test:api         # Test Core API
npm run test:admin       # Test Admin Interface
npm run test             # Test all services

# Linting
npm run lint:api         # Lint Core API
npm run lint:admin       # Lint Admin Interface
npm run lint             # Lint all services
```

### Frontend Development

```bash
cd frontend

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code quality
npm run lint             # ESLint
npm run type-check       # TypeScript check
```

### Database Management

```bash
# Prisma operations (from backend/core-api)
npx prisma generate      # Generate client
npx prisma migrate dev   # Create & apply migration
npx prisma migrate reset # Reset database
npx prisma db push       # Push schema changes
npx prisma studio        # Database GUI
```

---

## 🌐 Service Endpoints

### Core Banking API (Port 3001)

```text
Base URL: http://localhost:3001

Authentication:
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
DELETE /auth/logout

Accounts:
GET    /accounts
GET    /accounts/:id
POST   /accounts
PUT    /accounts/:id
DELETE /accounts/:id

Transactions:
GET    /transactions
GET    /transactions/:id
POST   /transactions
GET    /accounts/:id/transactions

Wire Transfers:
GET    /wire-transfers
POST   /wire-transfers
PUT    /wire-transfers/:id
GET    /wire-transfers/:id/status

Users:
GET    /users/profile
PUT    /users/profile
GET    /users/kyc-status
POST   /users/kyc-documents

API Documentation:
GET    /docs                # Swagger UI
GET    /docs/json           # OpenAPI JSON
```

### Admin Control Center (Port 3002)

```text
Base URL: http://localhost:3002

Dashboard:
GET    /admin/dashboard
GET    /admin/analytics

User Management:
GET    /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id/status
GET    /admin/users/:id/kyc

Transaction Management:
GET    /admin/transactions
GET    /admin/transactions/pending
PUT    /admin/transactions/:id/approve
PUT    /admin/transactions/:id/reject

Wire Transfer Queue:
GET    /admin/wire-transfers
GET    /admin/wire-transfers/queue
PUT    /admin/wire-transfers/:id/process

Compliance:
GET    /admin/compliance/alerts
GET    /admin/compliance/reports
POST   /admin/compliance/kyc-review
```

### Frontend Application (Port 3000)

```text
Base URL: http://localhost:3000

Public Pages:
/                        # Landing page
/about                   # About NovaBank
/contact                 # Contact information
/auth                    # Login/Register

Authenticated Pages:
/dashboard               # User dashboard
/accounts                # Account management
/transactions            # Transaction history
/transfers               # Money transfers
/wire-transfers          # International transfers
/profile                 # User profile
/settings                # Account settings
```

---

## 🔒 Security Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aurum_vault"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret"
CLERK_SECRET_KEY="your-clerk-secret-key"
CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"

# API Configuration
API_PORT=3001
ADMIN_PORT=3002
FRONTEND_PORT=3000

# Security
SESSION_SECRET="your-session-secret"
ENCRYPTION_KEY="your-encryption-key"

# External Services
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
SENDGRID_API_KEY="your-sendgrid-key"
```

### Security Features

- **Authentication**: Clerk-based authentication with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: AES-256-GCM for sensitive data
- **API Security**: Rate limiting, CORS, helmet security headers
- **Database Security**: Parameterized queries, connection pooling
- **Session Management**: Redis-based session storage
- **Audit Logging**: Comprehensive audit trail for all operations

---

## 🧪 Testing Strategy

### Unit Testing

```bash
# Backend API tests
cd backend/core-api
npm test

# Frontend component tests
cd frontend
npm test
```

### Integration Testing

```bash
# API integration tests
cd backend
npm run test:integration

# End-to-end tests
npm run test:e2e
```

### Load Testing

```bash
# API load testing
cd backend/core-api
npm run test:load

# Database performance testing
npm run test:db-performance
```

---

## 🚀 Deployment Guide

### Production Deployment

```bash
# Build all services
cd backend
npm run build

cd ../frontend
npm run build

# Deploy with Docker
cd ../backend
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Environment-Specific Configurations

```bash
# Development
NODE_ENV=development

# Staging
NODE_ENV=staging

# Production
NODE_ENV=production
```

---

## 📊 Monitoring & Observability

### Health Checks

```text
Core API Health:     GET /health
Admin Health:        GET /admin/health
Database Health:     GET /health/db
Redis Health:        GET /health/redis
```

### Logging

- **Application Logs**: Winston with structured logging
- **Access Logs**: Morgan for HTTP request logging
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Prometheus + Grafana

### Monitoring Endpoints

```text
Metrics:             GET /metrics
Health Status:       GET /health
API Documentation:   GET /docs
Admin Dashboard:     GET /admin/dashboard
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Check PostgreSQL status
   docker-compose logs postgres
   
   # Reset database
   npm run db:migrate:reset
   ```

2. **Redis Connection Issues**

   ```bash
   # Check Redis status
   docker-compose logs redis
   
   # Clear Redis cache
   redis-cli FLUSHALL
   ```

3. **Port Conflicts**

   ```bash
   # Check port usage
   lsof -i :3001
   lsof -i :3002
   lsof -i :3000
   ```

4. **Build Issues**

   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode

```bash
# Enable debug logging
DEBUG=aurum:* npm run dev

# Verbose logging
LOG_LEVEL=debug npm run dev
```

---

## 📚 Additional Resources

### Documentation Links

- [Master Implementation Guide](./MASTER_IMPLEMENTATION_GUIDE.md)
- [Aurum Design System](./AURUM_DESIGN_SYSTEM.md)
- [Security & Compliance](./SECURITY_COMPLIANCE_IMPLEMENTATION.md)
- [Frontend Transformation Guide](./FRONTEND_TRANSFORMATION_GUIDE.md)
- [Backend API Implementation](./BACKEND_API_IMPLEMENTATION.md)
- [Admin Control Center](./ADMIN_CONTROL_CENTER.md)

### External Documentation

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Docker Documentation](https://docs.docker.com/)

---

## 🤝 Development Team

For questions, issues, or contributions, please contact the Aurum Vault development team or refer to the project documentation.

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active Development
