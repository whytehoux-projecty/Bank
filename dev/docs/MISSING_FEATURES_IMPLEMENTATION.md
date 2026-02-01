# 🚀 Missing Features Implementation Roadmap

**Organization:** United Health Initiatives  
**Version:** 1.0  
**Date:** January 10, 2026

---

## Overview

This document addresses all features that were in the original plan but not yet implemented.

---

## 1. Redis Cache Integration

### Current Status: ❌ Not Implemented

### Why It's Needed

- Session management for JWT token blacklisting
- Caching frequently accessed data
- Rate limiting persistence across servers
- Real-time features (future)

### Implementation Plan

#### Step 1: Install Redis Dependencies

```bash
npm install redis ioredis
npm install --save-dev @types/ioredis
```

#### Step 2: Create Redis Configuration

**File:** `src/config/redis.ts`

```typescript
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Cache helpers
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (
  key: string, 
  value: unknown, 
  ttlSeconds: number = 3600
): Promise<void> => {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDel = async (key: string): Promise<void> => {
  await redis.del(key);
};

// Token blacklist
export const blacklistToken = async (
  token: string, 
  expiresInSeconds: number
): Promise<void> => {
  await redis.setex(`blacklist:${token}`, expiresInSeconds, '1');
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redis.get(`blacklist:${token}`);
  return result === '1';
};
```

#### Step 3: Update Auth Middleware

```typescript
// In auth.middleware.ts
import { isTokenBlacklisted } from '../../config/redis';

export const authMiddleware = async (req, res, next) => {
  // ... existing token extraction ...
  
  // Check if token is blacklisted
  if (await isTokenBlacklisted(token)) {
    return next(new AppError('Token has been revoked', 401));
  }
  
  // ... rest of verification ...
};
```

#### Step 4: Update Docker Compose

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

---

## 2. Column-Level Encryption for PII

### Current Status: ❌ Not Implemented

### Why It's Needed

- Sensitive data protection (SSN, bank accounts)
- Regulatory compliance (GDPR, HIPAA)
- Defense in depth

### Implementation Plan

#### Step 1: Create Encryption Utility

**File:** `src/shared/utils/encryption.ts`

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 characters');
}

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedData: string): string => {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Mask sensitive data for display
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) return '****';
  return `****${accountNumber.slice(-4)}`;
};

export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 4) return '****';
  return `${phone.slice(0, 3)}****${phone.slice(-2)}`;
};
```

#### Step 2: Apply to Bank Account Model

```typescript
// In bank account service
import { encrypt, decrypt, maskAccountNumber } from '../utils/encryption';

class BankAccountService {
  async create(data: CreateBankAccountDTO) {
    return prisma.bankAccount.create({
      data: {
        ...data,
        accountNumber: encrypt(data.accountNumber),
        routingNumber: data.routingNumber ? encrypt(data.routingNumber) : null,
      }
    });
  }
  
  async getForStaff(userId: string) {
    const accounts = await prisma.bankAccount.findMany({
      where: { user_id: userId }
    });
    
    // Return masked data for staff
    return accounts.map(acc => ({
      ...acc,
      accountNumber: maskAccountNumber(decrypt(acc.accountNumber)),
      routingNumber: acc.routingNumber ? '****' : null,
    }));
  }
  
  async getForAdmin(userId: string) {
    const accounts = await prisma.bankAccount.findMany({
      where: { user_id: userId }
    });
    
    // Return full data for admin
    return accounts.map(acc => ({
      ...acc,
      accountNumber: decrypt(acc.accountNumber),
      routingNumber: acc.routingNumber ? decrypt(acc.routingNumber) : null,
    }));
  }
}
```

---

## 3. Multi-Factor Authentication (MFA)

### Current Status: ❌ Not Implemented

### Why It's Needed

- Enhanced security for admin accounts
- Compliance with USAID security requirements
- Protection against credential theft

### Implementation Plan

#### Step 1: Install Dependencies

```bash
npm install speakeasy qrcode
npm install --save-dev @types/speakeasy @types/qrcode
```

#### Step 2: Update User Schema

```prisma
model User {
  // ... existing fields ...
  
  mfa_enabled       Boolean   @default(false)
  mfa_secret        String?   @db.VarChar(100)
  mfa_backup_codes  Json?     @db.JsonB
}
```

#### Step 3: Create MFA Service

**File:** `src/modules/auth/mfa.service.ts`

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class MFAService {
  async setupMFA(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `UHI Portal (${userId})`,
      issuer: 'United Health Initiatives',
      length: 20,
    });
    
    // Save secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: { mfa_secret: secret.base32 }
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }
  
  async enableMFA(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.mfa_secret) {
      throw new AppError('MFA setup not initiated', 400);
    }
    
    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    
    if (!isValid) {
      throw new AppError('Invalid verification code', 400);
    }
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfa_enabled: true,
        mfa_backup_codes: backupCodes.map(code => ({
          code: crypto.createHash('sha256').update(code).digest('hex'),
          used: false,
        })),
      }
    });
    
    return { backupCodes };
  }
  
  async verifyMFA(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.mfa_enabled || !user.mfa_secret) {
      return true; // MFA not enabled
    }
    
    return speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
  
  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }
}
```

#### Step 4: Update Login Flow

```typescript
// In auth.service.ts
async login(data: LoginDTO) {
  // ... existing password verification ...
  
  if (user.mfa_enabled) {
    // Return partial token requiring MFA verification
    const mfaToken = jwt.sign(
      { userId: user.id, mfaPending: true },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    return {
      requiresMFA: true,
      mfaToken,
    };
  }
  
  // ... continue with normal token generation ...
}

async verifyMFALogin(mfaToken: string, code: string) {
  const payload = jwt.verify(mfaToken, JWT_SECRET) as { userId: string; mfaPending: boolean };
  
  if (!payload.mfaPending) {
    throw new AppError('Invalid MFA token', 400);
  }
  
  const isValid = await mfaService.verifyMFA(payload.userId, code);
  
  if (!isValid) {
    throw new AppError('Invalid verification code', 401);
  }
  
  // Generate full tokens
  return generateTokens({ userId: payload.userId, ... });
}
```

---

## 4. Bulk Operations

### Current Status: ⚠️ Partial (Loans Only)

### Implementation Plan

#### Staff Bulk Import (CSV)

**File:** `src/modules/admin/bulk.service.ts`

```typescript
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

const staffRowSchema = z.object({
  staff_id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  department: z.string(),
  staff_type: z.enum(['field', 'non_field']),
  position: z.string(),
});

export class BulkService {
  async importStaff(csvBuffer: Buffer, adminId: string) {
    const records = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
    });
    
    const results = {
      total: records.length,
      successful: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    };
    
    for (let i = 0; i < records.length; i++) {
      try {
        const parsed = staffRowSchema.parse(records[i]);
        
        await prisma.user.create({
          data: {
            staff_id: parsed.staff_id,
            email: parsed.email,
            first_name: parsed.first_name,
            last_name: parsed.last_name,
            password_hash: await bcrypt.hash('TempPassword123!', 10),
            status: 'active',
          }
        });
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2, // 1-indexed, accounting for header
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return results;
  }
}
```

#### Bulk Leave Adjustment

```typescript
async bulkAdjustLeave(
  year: number,
  leaveType: 'annual' | 'sick' | 'rr',
  adjustment: number,
  reason: string,
  adminId: string
) {
  const result = await prisma.leaveBalance.updateMany({
    where: { year },
    data: {
      [`${leaveType}_total`]: { increment: adjustment },
    }
  });
  
  // Log the bulk action
  await prisma.auditLog.create({
    data: {
      action: 'BULK_LEAVE_ADJUSTMENT',
      performed_by: adminId,
      details: {
        year,
        leaveType,
        adjustment,
        reason,
        affectedCount: result.count,
      }
    }
  });
  
  return result;
}
```

---

## 5. S3/MinIO Integration

### Current Status: ⚠️ Local Storage Only

### Implementation Plan

**File:** `src/shared/utils/storage.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';

// S3 Configuration
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || 'uhi-staff-portal';

export const uploadFile = async (
  buffer: Buffer, 
  filename: string, 
  folder: string = '',
  contentType: string = 'application/octet-stream'
): Promise<string> => {
  if (STORAGE_TYPE === 's3') {
    const key = folder ? `${folder}/${filename}` : filename;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    
    return `s3://${BUCKET}/${key}`;
  } else {
    // Local storage fallback
    return localUpload(buffer, filename, folder);
  }
};

export const getSignedDownloadUrl = async (
  fileUrl: string, 
  expiresIn: number = 3600
): Promise<string> => {
  if (fileUrl.startsWith('s3://')) {
    const key = fileUrl.replace(`s3://${BUCKET}/`, '');
    
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  } else {
    // Local file - return relative URL
    return fileUrl;
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (fileUrl.startsWith('s3://')) {
    const key = fileUrl.replace(`s3://${BUCKET}/`, '');
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  } else {
    await localDelete(fileUrl);
  }
};
```

---

## 6. Export Functionality (CSV/Excel)

### Current Status: ❌ Not Implemented

### Implementation Plan

#### Install Dependencies

```bash
npm install exceljs
npm install --save-dev @types/exceljs
```

#### Create Export Service

**File:** `src/shared/utils/export.ts`

```typescript
import ExcelJS from 'exceljs';

export class ExportService {
  async exportStaffToExcel(filters?: StaffFilters): Promise<Buffer> {
    const staff = await prisma.user.findMany({
      where: filters,
      include: {
        staff_profile: true,
        employment_history: {
          take: 1,
          orderBy: { start_date: 'desc' },
          include: { department: true }
        }
      }
    });
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'UHI Staff Portal';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Staff List');
    
    // Define columns
    worksheet.columns = [
      { header: 'Staff ID', key: 'staffId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Staff Type', key: 'staffType', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Join Date', key: 'joinDate', width: 12 },
    ];
    
    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '002F6C' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    
    // Add data
    staff.forEach(user => {
      worksheet.addRow({
        staffId: user.staff_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        department: user.employment_history[0]?.department?.name || 'N/A',
        position: user.employment_history[0]?.position_title || 'N/A',
        staffType: user.staff_profile?.staff_type || 'N/A',
        status: user.status,
        joinDate: user.created_at.toISOString().split('T')[0],
      });
    });
    
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
  
  async exportPayrollToExcel(year: number, month: number): Promise<Buffer> {
    // Similar implementation for payroll export
  }
  
  exportToCSV(data: unknown[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = (item as Record<string, unknown>)[col];
        // Escape commas and quotes
        const str = String(value ?? '');
        return str.includes(',') || str.includes('"') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(',')
    );
    
    return [header, ...rows].join('\n');
  }
}
```

---

## 7. OpenAPI/Swagger Documentation

### Current Status: ❌ Not Implemented

### Implementation Plan

#### Install Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

#### Create Swagger Configuration

**File:** `src/config/swagger.ts`

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UHI Staff Portal API',
      version: '2.0.0',
      description: 'API documentation for United Health Initiatives Staff Portal',
      contact: {
        name: 'UHI IT Support',
        email: 'it@uhi.org',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.uhiportal.org/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.types.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'UHI Staff Portal API',
  }));
  
  // Serve raw JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.json(specs);
  });
};
```

#### Add JSDoc Comments to Routes

```typescript
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with staff credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *               - password
 *             properties:
 *               staffId:
 *                 type: string
 *                 example: UHI-2024-00142
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateBody(loginSchema), authController.login);
```

---

## Implementation Priority

| Feature | Priority | Effort | Dependencies |
|---------|----------|--------|--------------|
| OpenAPI Docs | 🔴 High | 8h | None |
| Column Encryption | 🔴 High | 12h | None |
| Export (CSV/Excel) | 🔴 High | 10h | None |
| Redis Cache | 🟡 Medium | 8h | Redis server |
| S3 Integration | 🟡 Medium | 8h | S3/MinIO |
| Bulk Operations | 🟡 Medium | 16h | None |
| MFA | 🟢 Low | 20h | None |

---

*Missing Features Roadmap v1.0*  
*United Health Initiatives Staff Portal*
