# AURUM VAULT Testing Strategy

This directory contains global test configurations or shared test resources. Each service also maintains its own test suite.

## 🧪 Testing Overview

The project uses a mix of Unit, Integration, and End-to-End (E2E) testing.

### Backend Testing

- **Framework**: Jest
- **Location**: `backend/core-api`
- **Type**: Unit & Integration tests for API endpoints and services.
- **Command**: `npm test`

### Admin Interface Testing

- **Framework**: Jest
- **Location**: `admin-interface`
- **Type**: Unit & Integration tests.
- **Command**: `npm test`

### E-Banking Portal Testing

- **Framework**: Jest (Unit/Component) & Playwright (E2E)
- **Location**: `e-banking-portal`
- **Commands**:
  - Unit: `npm test`
  - E2E: `cd e2e && npm run test:e2e`

## 🏃 Running All Tests

You can run tests for individual services as described above. A global test runner script may be added in the future.

## 📁 Directory Structure

- `e2e/`: Global E2E tests (if applicable outside of Portal)
- `performance/`: k6 or JMeter performance test scripts
- `external/`: Tests for external integrations
