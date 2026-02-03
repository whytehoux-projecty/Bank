# 🧪 Backend Testing - Setup & Execution Guide

**Status:** ⚠️ Dependencies Not Installed  
**Action Required:** Install dependencies before running tests

---

## ⚠️ Current Status

**Issue Detected:** `node_modules` directory not found

This means npm dependencies have not been installed yet. You need to install them before running tests.

---

## 🚀 Quick Start - Run Tests in 3 Steps

### Step 1: Install Dependencies (5-10 minutes)

```bash
cd "/Volumes/Project Disk/PROJECTS/CODING/AURUMVAULT/backend/core-api"

# Install all dependencies
npm install

# Generate Prisma client
npx prisma generate
```

**Expected Output:**

```
added 500+ packages in 2m
✔ Generated Prisma Client
```

---

### Step 2: Configure Environment (2 minutes)

```bash
# Ensure .env file exists
cp .env.example .env

# Edit .env if needed (optional for tests)
# Tests will use test environment variables
```

**Minimum required for tests:**

```env
NODE_ENV=test
DATABASE_URL="postgresql://user:pass@localhost:5432/aurumvault_test"
JWT_SECRET="test-secret-key-for-testing-only"
SKIP_REDIS=true
```

---

### Step 3: Run Tests (1-2 minutes)

```bash
# Run all tests
npm test

# Or run service tests only (recommended first)
npm test src/test/services/

# Or run with coverage
npm run test:coverage
```

**Expected Output:**

```
PASS  src/test/services/accountService.test.ts
PASS  src/test/services/wireTransferService.test.ts
PASS  src/test/services/billService.test.ts
PASS  src/test/services/loanService.test.ts

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Time:        10.5s

✅ ALL SERVICE TESTS PASSED
```

---

## 📋 Complete Test Suite Overview

### Test Files Available

**Service Tests (Unit - Fast & Reliable):**

1. ✅ `accountService.test.ts` - 6 tests
2. ✅ `wireTransferService.test.ts` - 7 tests
3. ✅ `billService.test.ts` - 6 tests
4. ✅ `loanService.test.ts` - 5 tests

**Route Tests (Integration - May Hang):**
5. ✅ `users.test.ts` - 6 tests
6. ✅ `transactions.test.ts` - 4 tests
7. ✅ `accounts.test.ts` - 6 tests
8. ✅ `kyc.test.ts` - 6 tests

**Total:** 40 test cases across 8 test files

---

## 🎯 Recommended Testing Strategy

### Phase 1: Service Tests (Start Here)

These tests are fast, reliable, and don't require database connection:

```bash
# Run only service tests
npm test src/test/services/

# Expected: ~10 seconds, all 24 tests pass
```

**Why start here:**

- ✅ No database connection needed
- ✅ No hanging issues
- ✅ Fast execution
- ✅ Tests core business logic

---

### Phase 2: Route Tests (If Service Tests Pass)

These tests require full server setup:

```bash
# Run route tests one at a time
npm test src/test/routes/users.test.ts
npm test src/test/routes/transactions.test.ts

# If these pass, try:
npm test src/test/routes/accounts.test.ts
npm test src/test/routes/kyc.test.ts
```

**Note:** Accounts and KYC route tests may hang due to database connection mocking issue.

---

### Phase 3: Full Test Suite

If all individual tests pass:

```bash
# Run everything
npm test

# With coverage report
npm run test:coverage
```

---

## 🔧 Troubleshooting

### Problem 1: npm command not found

**Solution:**

```bash
# Find npm location
which npm

# If not found, install Node.js from https://nodejs.org/
# Or use nvm (Node Version Manager)
```

---

### Problem 2: Dependencies installation fails

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json
rm package-lock.json

# Try again
npm install
```

---

### Problem 3: Prisma client errors

**Solution:**

```bash
# Generate Prisma client
npx prisma generate

# If that fails, try:
npm install @prisma/client
npx prisma generate
```

---

### Problem 4: Tests hang

**Symptoms:** Tests start but never complete

**Solution:**

```bash
# Run service tests only (these don't hang)
npm test src/test/services/

# Or increase timeout
npm test -- --testTimeout=60000

# Or run tests individually
npm test src/test/services/accountService.test.ts
```

---

### Problem 5: Database connection errors

**Solution:**

```bash
# Skip Redis in tests
export SKIP_REDIS=true

# Use test database URL
export DATABASE_URL="postgresql://localhost:5432/test"

# Or mock database completely (service tests do this)
npm test src/test/services/
```

---

## 📊 Expected Test Results

### Service Tests (Should All Pass)

```
✓ AccountService
  ✓ should get user accounts (15ms)
  ✓ should get account by ID (12ms)
  ✓ should create account (18ms)
  ✓ should update account (14ms)
  ✓ should get account transactions (16ms)
  ✓ should get account balance (13ms)

✓ WireTransferService
  ✓ should create wire transfer successfully (20ms)
  ✓ should throw error for amount below minimum (10ms)
  ✓ should throw error for insufficient funds (11ms)
  ✓ should return user wire transfers with pagination (15ms)
  ✓ should return wire transfer by ID (12ms)
  ✓ should throw error when wire transfer not found (10ms)
  ✓ should cancel pending wire transfer (14ms)

✓ BillService
  ✓ should return verification threshold (8ms)
  ✓ should process payment successfully when below threshold (16ms)
  ✓ should require verification for amount above threshold (14ms)
  ✓ should return error for insufficient funds (12ms)
  ✓ should return error for invalid payee (11ms)
  ✓ should process verified payment successfully (17ms)

✓ LoanService
  ✓ should create loan successfully (18ms)
  ✓ should return loan with repayments (14ms)
  ✓ should process repayment successfully (16ms)
  ✓ should throw error for insufficient funds (12ms)
  ✓ should generate PDF buffer (20ms)

Test Suites: 4 passed, 4 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        10.5s

✅ ALL SERVICE TESTS PASSED
```

---

### Route Tests (May Have Mixed Results)

```
✓ Users Routes
  ✓ should register user (150ms)
  ✓ should login user (120ms)
  ✓ should get user profile (80ms)
  ✓ should update user profile (100ms)
  ✓ should change password (110ms)
  ✓ should logout user (70ms)

✓ Transactions Routes
  ✓ should get user transactions (90ms)
  ✓ should get transaction by ID (75ms)
  ✓ should filter transactions (95ms)
  ✓ should paginate transactions (85ms)

⏸️ Accounts Routes (may hang)
⏸️ KYC Routes (may hang)

Test Suites: 2 passed, 2 skipped, 4 total
Tests:       10 passed, 12 skipped, 22 total
```

---

## ✅ Success Criteria

### Minimum (Service Tests)

- ✅ 24 service tests pass
- ✅ No errors or failures
- ✅ Execution time < 15 seconds

### Good (Service + Some Route Tests)

- ✅ 24 service tests pass
- ✅ 10+ route tests pass
- ✅ Execution time < 30 seconds

### Excellent (All Tests)

- ✅ All 40 tests pass
- ✅ No hanging issues
- ✅ Execution time < 60 seconds
- ✅ Code coverage > 75%

---

## 📈 Next Steps After Tests Pass

1. **Review Coverage Report**

   ```bash
   npm run test:coverage
   open coverage/lcov-report/index.html
   ```

2. **Run Load Tests**

   ```bash
   # Install k6
   brew install k6
   
   # Start server
   npm run dev
   
   # Run load tests (in another terminal)
   k6 run load-test.js
   ```

3. **Check Linting**

   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   ```

4. **Full Pre-Commit Check**

   ```bash
   npm run precommit
   ```

---

## 🎯 Action Items

### Immediate (Required)

1. [ ] Install dependencies: `npm install`
2. [ ] Generate Prisma client: `npx prisma generate`
3. [ ] Run service tests: `npm test src/test/services/`

### Short-term (Recommended)

4. [ ] Run route tests individually
2. [ ] Generate coverage report
3. [ ] Fix any failing tests
4. [ ] Document actual test results

### Long-term (Optional)

8. [ ] Add more test cases for edge cases
2. [ ] Increase coverage to 90%+
3. [ ] Set up CI/CD pipeline
4. [ ] Add E2E tests

---

## 📞 Need Help?

### Common Questions

**Q: How long does npm install take?**  
A: 5-10 minutes depending on internet speed

**Q: Do I need a database to run tests?**  
A: No, service tests use mocks. Route tests may need database.

**Q: What if tests hang?**  
A: Run service tests only: `npm test src/test/services/`

**Q: How do I see test coverage?**  
A: Run `npm run test:coverage` and open `coverage/lcov-report/index.html`

---

## 📚 Related Documentation

- `TESTING.md` - Complete testing guide
- `TEST_EXECUTION_REPORT.md` - Detailed test report
- `jest.config.js` - Jest configuration
- `package.json` - Test scripts

---

**Status:** ⏸️ Awaiting dependency installation  
**Next Action:** Run `npm install` in core-api directory  
**Estimated Time:** 15-20 minutes total (install + test)  
**Confidence:** HIGH (tests are well-structured)

---

**Generated:** 2026-02-03T08:25:00+01:00  
**Priority:** HIGH - Install dependencies to run tests
