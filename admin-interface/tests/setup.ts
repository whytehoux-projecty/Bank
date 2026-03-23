import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Disable foreign key checks is not needed for Postgres if delete order is correct
  // or we would use TRUNCATE CASCADE if needed.
  // We will rely on correct delete order below.

  try {
    // Truncate all tables
    await prisma.portalStatusAudit.deleteMany();
    await prisma.portalStatus.deleteMany();
    await prisma.paymentVerification.deleteMany();
    await prisma.systemConfig.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.adminSession.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.kycDocument.deleteMany();
    await prisma.wireTransfer.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.card.deleteMany();
    await prisma.statement.deleteMany();
    await prisma.billPayee.deleteMany();
    await prisma.beneficiary.deleteMany();
    await prisma.account.deleteMany();
    await prisma.address.deleteMany();
    await prisma.contactSubmission.deleteMany();
    await prisma.accountApplication.deleteMany();
    await prisma.user.deleteMany();
    await prisma.fxRate.deleteMany();
  } finally {
    // Re-enable not needed
  }
}

export async function setupTestData() {
  // No need to create AdminRole entries as they are now part of AdminUser directly
  console.log("Test data setup completed");
}

// Global setup
beforeAll(async () => {
  await cleanDatabase();
  await setupTestData();
});

// Clean up after each test
afterEach(async () => {
  await cleanDatabase();
});

// Global teardown
afterAll(async () => {
  await prisma.$disconnect();
});
