# 🔌 Enhanced API Specification

**Organization:** United Health Initiatives  
**Version:** 2.0  
**Date:** January 10, 2026

---

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.uhiportal.org/api/v1
```

---

## Authentication

All protected endpoints require Bearer token:

```
Authorization: Bearer <access_token>
```

---

## API Modules

### 1. Staff Profile API

#### Get Extended Profile (Staff)

```http
GET /staff/profile/extended
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "passportPhotoUrl": "https://...",
    "dateOfBirth": "1985-03-15",
    "nationality": "United States",
    "bloodType": "O_POSITIVE",
    "staffType": "field",
    "specialization": "Emergency Medicine",
    "personalPhone": "+1-555-0123",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1-555-0124",
      "relation": "Spouse"
    },
    "currentDeployment": {
      "missionName": "Syria Emergency Response",
      "country": "Syria",
      "city": "Damascus",
      "startDate": "2025-10-15"
    }
  }
}
```

#### Update Extended Profile (Admin Only)

```http
PUT /admin/staff/:userId/profile
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "dateOfBirth": "1985-03-15",
  "nationality": "United States",
  "bloodType": "O_POSITIVE",
  "staffType": "field",
  "specialization": "Emergency Medicine",
  "personalPhone": "+1-555-0123",
  "permanentAddress": "123 Main St, City, State",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1-555-0124",
  "emergencyContactRelation": "Spouse"
}
```

#### Upload Passport Photo (Admin Only)

```http
POST /admin/staff/:userId/photo
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "photo": <file>
}
```

**Validation:**

- Max size: 5MB
- Allowed formats: JPEG, PNG
- Minimum resolution: 400x500
- Aspect ratio: 3:4 (passport standard)

---

### 2. Bank Account API

#### Get Bank Accounts (Staff - Own Only)

```http
GET /staff/bank-accounts
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "isPrimary": true,
      "accountHolderName": "John Smith",
      "bankName": "First National Bank",
      "accountNumber": "****4567",  // Masked
      "swiftCode": "FNBKUS33",
      "currency": "USD",
      "isVerified": true
    }
  ]
}
```

> **Note:** Account numbers are masked for staff. Full numbers only visible to admin.

#### Get All Bank Accounts (Admin)

```http
GET /admin/staff/:userId/bank-accounts
Authorization: Bearer <admin_token>
```

**Response includes full account numbers.**

#### Create Bank Account (Admin Only)

```http
POST /admin/staff/:userId/bank-accounts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isPrimary": true,
  "accountHolderName": "John Smith",
  "bankName": "First National Bank",
  "bankBranch": "Downtown Branch",
  "accountNumber": "1234567890",
  "routingNumber": "021000089",
  "swiftCode": "FNBKUS33",
  "iban": null,
  "currency": "USD",
  "bankAddress": "100 Bank Street, New York, NY",
  "accountType": "checking",
  "accountPurpose": "salary"
}
```

#### Update Bank Account (Admin Only)

```http
PUT /admin/bank-accounts/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "bankName": "Updated Bank Name",
  "isVerified": true
}
```

#### Delete Bank Account (Admin Only)

```http
DELETE /admin/bank-accounts/:id
Authorization: Bearer <admin_token>
```

---

### 3. Family Members API

#### Get Family Members (Staff - Own Only)

```http
GET /staff/family-members
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "relationship": "spouse",
      "dateOfBirth": "1987-06-20",
      "isDependent": true,
      "isEmergencyContact": true,
      "isBeneficiary": true,
      "beneficiaryPercentage": 50.00
    },
    {
      "id": "uuid",
      "firstName": "Emma",
      "lastName": "Smith",
      "relationship": "child",
      "dateOfBirth": "2015-09-10",
      "isDependent": true,
      "isBeneficiary": true,
      "beneficiaryPercentage": 25.00
    }
  ]
}
```

#### Get All Family Members (Admin)

```http
GET /admin/staff/:userId/family-members
Authorization: Bearer <admin_token>
```

#### Create Family Member (Admin Only)

```http
POST /admin/staff/:userId/family-members
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "relationship": "spouse",
  "dateOfBirth": "1987-06-20",
  "gender": "female",
  "nationality": "United States",
  "phone": "+1-555-0124",
  "email": "jane.smith@email.com",
  "isDependent": true,
  "isEmergencyContact": true,
  "isBeneficiary": true,
  "beneficiaryPercentage": 50.00
}
```

#### Update Family Member (Admin Only)

```http
PUT /admin/family-members/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "phone": "+1-555-9999",
  "isEmergencyContact": false
}
```

#### Delete Family Member (Admin Only)

```http
DELETE /admin/family-members/:id
Authorization: Bearer <admin_token>
```

---

### 4. Deployment History API

#### Get Deployment History (Staff - Own Only)

```http
GET /staff/deployments
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "missionName": "Syria Emergency Response",
      "missionCode": "SYR-2025-001",
      "country": "Syria",
      "region": "Damascus Region",
      "city": "Damascus",
      "startDate": "2025-10-15",
      "endDate": null,
      "status": "active",
      "deploymentRole": "Field Physician",
      "hardshipLevel": "E",
      "dangerPayEligible": true,
      "rrEligible": true
    },
    {
      "id": "uuid",
      "missionName": "Yemen Health Program",
      "country": "Yemen",
      "startDate": "2023-03-01",
      "endDate": "2025-09-30",
      "status": "completed",
      "deploymentRole": "Senior Medical Officer",
      "hardshipLevel": "E"
    }
  ]
}
```

#### Get Current Deployment

```http
GET /staff/deployments/current
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "missionName": "Syria Emergency Response",
    "country": "Syria",
    "status": "active",
    "startDate": "2025-10-15",
    "expectedEndDate": "2026-04-15",
    "daysRemaining": 95,
    "deploymentRole": "Field Physician"
  }
}
```

#### Create Deployment (Admin Only)

```http
POST /admin/staff/:userId/deployments
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "missionName": "Syria Emergency Response",
  "missionCode": "SYR-2025-001",
  "projectName": "Emergency Medical Services",
  "projectCode": "EMS-SYR",
  "country": "Syria",
  "region": "Damascus Region",
  "city": "Damascus",
  "dutyStation": "UHI Field Hospital",
  "startDate": "2025-10-15",
  "expectedEndDate": "2026-04-15",
  "deploymentRole": "Field Physician",
  "supervisorId": "uuid",
  "deploymentType": "emergency",
  "hardshipLevel": "E",
  "dangerPayEligible": true,
  "rrEligible": true,
  "securityLevel": "extreme",
  "perDiemRate": 150.00,
  "currency": "USD"
}
```

#### Update Deployment (Admin Only)

```http
PUT /admin/deployments/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "endDate": "2026-01-15",
  "status": "completed"
}
```

#### Extend Deployment (Admin Only)

```http
POST /admin/deployments/:id/extend
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newEndDate": "2026-07-15",
  "reason": "Mission extension approved"
}
```

---

### 5. Staff Documents API

#### Get Documents (Staff - Own Only)

```http
GET /staff/documents
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "documentType": "passport",
      "documentName": "US Passport",
      "documentNumber": "****4567",
      "issuingCountry": "United States",
      "issueDate": "2020-05-15",
      "expiryDate": "2030-05-14",
      "verificationStatus": "verified",
      "isExpired": false,
      "daysUntilExpiry": 1520
    },
    {
      "id": "uuid",
      "documentType": "medical_license",
      "documentName": "MD License - California",
      "documentNumber": "****1234",
      "expiryDate": "2026-06-30",
      "verificationStatus": "verified",
      "daysUntilExpiry": 171
    }
  ]
}
```

#### Get Document File (Staff - Own Only)

```http
GET /staff/documents/:id/download
Authorization: Bearer <token>
```

**Response:** File download

#### Upload Document (Admin Only)

```http
POST /admin/staff/:userId/documents
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "documentType": "passport",
  "documentName": "US Passport",
  "documentNumber": "123456789",
  "issuingAuthority": "U.S. Department of State",
  "issuingCountry": "United States",
  "issueDate": "2020-05-15",
  "expiryDate": "2030-05-14",
  "file": <file>
}
```

#### Verify Document (Admin Only)

```http
POST /admin/documents/:id/verify
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "verified",
  "notes": "Verified against original"
}
```

#### Delete Document (Admin Only)

```http
DELETE /admin/documents/:id
Authorization: Bearer <admin_token>
```

---

### 6. Leave Balance API

#### Get Leave Balance (Staff)

```http
GET /staff/leave-balance
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "annual": {
      "total": 21,
      "used": 7,
      "pending": 2,
      "available": 12,
      "carriedOver": 3
    },
    "sick": {
      "total": 15,
      "used": 2,
      "available": 13
    },
    "maternity": {
      "total": 90,
      "used": 0,
      "available": 90
    },
    "paternity": {
      "total": 14,
      "used": 0,
      "available": 14
    },
    "rr": {
      "total": 10,
      "used": 5,
      "available": 5,
      "note": "R&R for hardship duty station"
    }
  }
}
```

#### Update Leave Balance (Admin Only)

```http
PUT /admin/staff/:userId/leave-balance
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "year": 2026,
  "annualUsed": 10,
  "sickUsed": 3,
  "annualCarriedOver": 5
}
```

---

### 7. Admin Staff Management API

#### List All Staff

```http
GET /admin/staff
Authorization: Bearer <admin_token>
Query Parameters:
  - page (default: 1)
  - limit (default: 20)
  - search (staff name, ID, email)
  - staffType (field, non_field)
  - department
  - status (active, inactive)
  - deploymentStatus (deployed, office)
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### Create New Staff (Admin Only)

```http
POST /admin/staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "staffId": "UHI-2026-00200",
  "email": "john.smith@uhi.org",
  "password": "TemporaryPass123!",
  "firstName": "John",
  "lastName": "Smith",
  "profile": {
    "dateOfBirth": "1985-03-15",
    "nationality": "United States",
    "staffType": "field",
    "specialization": "Emergency Medicine"
  },
  "bankAccount": {
    "accountHolderName": "John Smith",
    "bankName": "First National Bank",
    "accountNumber": "1234567890"
  },
  "roles": ["staff"]
}
```

#### Get Staff Details (Admin)

```http
GET /admin/staff/:userId
Authorization: Bearer <admin_token>
```

**Returns complete staff information including unmasked data.**

#### Update Staff (Admin Only)

```http
PUT /admin/staff/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "john.smith@uhi.org",
  "firstName": "John",
  "lastName": "Smith",
  "status": "active"
}
```

#### Deactivate Staff (Admin Only)

```http
POST /admin/staff/:userId/deactivate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Contract ended",
  "effectiveDate": "2026-01-15"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5 req/15min |
| General API | 100 req/15min |
| File Uploads | 10 req/hour |
| Admin Operations | 200 req/15min |

---

*API Specification Version 2.0*  
*For United Health Initiatives Staff Portal*
