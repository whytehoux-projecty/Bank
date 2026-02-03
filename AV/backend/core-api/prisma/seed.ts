import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Inline generators to avoid module resolution issues
const generateAccountNumber = (): string => {
  const prefix = '21';
  const length = 10;
  let number = "";
  for (let i = 0; i < length; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return prefix + number;
};

const generateTransactionId = (): string => {
  return `TXN_${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
};

const generateWireTransferReference = (): string => {
  return `WIRE_${crypto.randomUUID().replace(/-/g, "").toUpperCase().substring(0, 16)}`;
};

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin users
  console.log('👤 Creating admin users...');

  const adminPassword = await bcrypt.hash('admin123!', 12);

  // Create admin user directly (AdminUser is independent in schema)
  await prisma.adminUser.upsert({
    where: { email: 'admin@aurumvault.com' },
    update: {},
    create: {
      email: 'admin@aurumvault.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      permissions: '*', // Schema defines this as String
      status: 'ACTIVE',
    },
  });

  // Create sample customers
  console.log('👥 Creating sample customers...');

  const customers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1985-06-15'),
      address: {
        street: '456 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
      },
      tier: 'GOLD',
      annualIncome: 120000,
      employmentStatus: 'EMPLOYED'
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1990-03-22'),
      address: {
        street: '789 Oak Avenue',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'US',
      },
      tier: 'PLATINUM',
      annualIncome: 250000,
      employmentStatus: 'SELF_EMPLOYED'
    },
    {
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1988-11-08'),
      address: {
        street: '321 Pine Road',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'US',
      },
      tier: 'BASIC',
      annualIncome: 60000,
      employmentStatus: 'EMPLOYED'
    },
  ];

  const createdUsers = [];
  for (const customer of customers) {
    const password = await bcrypt.hash('password123!', 12);

    // Deconstruct fields that don't belong to User model
    const { address, annualIncome, employmentStatus, ...userData } = customer;

    // Need to handle Address relation correctly
    // User model: address Address?
    // Address model: userId String @unique

    // We create User, then Address linked to it. But Prisma allows nested create.
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: password,
        status: 'ACTIVE',
        kycStatus: 'VERIFIED',
        address: {
          create: address
        }
      },
    });
    createdUsers.push(user);
  }

  // Create accounts for customers
  console.log('🏦 Creating bank accounts...');

  const createdAccounts = [];

  for (const user of createdUsers) {
    // Create checking account
    const checkingAccount = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: generateAccountNumber(),
        accountType: 'CHECKING',
        balance: Math.floor(Math.random() * 50000) + 5000,
        currency: 'USD',
        status: 'ACTIVE',
      },
    });

    createdAccounts.push(checkingAccount);

    // Create savings account for some users
    if (Math.random() > 0.3) {
      const savingsAccount = await prisma.account.create({
        data: {
          userId: user.id,
          accountNumber: generateAccountNumber(),
          accountType: 'SAVINGS',
          balance: Math.floor(Math.random() * 100000) + 10000,
          currency: 'USD',
          status: 'ACTIVE',
        },
      });

      createdAccounts.push(savingsAccount);
    }
  }

  // Create sample transactions
  console.log('💳 Creating sample transactions...');

  const transactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'];
  const descriptions = [
    'Direct Deposit - Salary',
    'ATM Withdrawal',
    'Online Transfer',
    'Bill Payment - Utilities',
    'Check Deposit',
    'Wire Transfer',
    'Merchant Payment',
    'Interest Payment',
  ];

  for (let i = 0; i < 50; i++) {
    const account = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = Math.floor(Math.random() * 2000) + 10;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    const transactionDate = new Date();
    transactionDate.setDate(transactionDate.getDate() - Math.floor(Math.random() * 30));

    await prisma.transaction.create({
      data: {
        id: generateTransactionId(),
        accountId: account.id, // Only one account link in schema (accountId)
        amount,
        type: transactionType,
        status: 'COMPLETED',
        description,
        reference: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`, // Unique reference required
        createdAt: transactionDate,
        metadata: JSON.stringify({
          channel: Math.random() > 0.5 ? 'ONLINE' : 'ATM',
          location: 'New York, NY',
        }),
      },
    });
  }

  // Create audit logs
  console.log('📋 Creating audit logs...');

  const admin = await prisma.adminUser.findUnique({ where: { email: 'admin@aurumvault.com' } });

  if (admin) {
    await prisma.auditLog.create({
      data: {
        adminUserId: admin.id,
        action: 'SYSTEM_INIT',
        entityType: 'SYSTEM',
        details: 'Database seeded',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');

  console.log('\n🔐 Admin Credentials:');
  console.log('Email: admin@aurumvault.com');
  console.log('Password: admin123!');

  console.log('\n👤 Sample Customer Credentials:');
  customers.forEach(customer => {
    console.log(`Email: ${customer.email} | Password: password123!`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });