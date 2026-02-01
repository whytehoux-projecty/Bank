# 📘 New API Endpoints - Quick Reference

**Version:** 1.0  
**Date:** January 31, 2026

---

## 🎯 **LEAVE BALANCE ENDPOINTS**

### **Staff Endpoints**

#### Get My Leave Balance

```http
GET /api/v1/staff/leave-balance
Authorization: Bearer {token}
```

**Query Parameters:**

- `year` (optional): Year to get balance for (default: current year)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "year": 2026,
    "annual_leave_total": 30,
    "annual_leave_used": 5,
    "annual_leave_pending": 2,
    "annual_leave_carryover": 3,
    "sick_leave_total": 14,
    "sick_leave_used": 1,
    "maternity_leave_total": 90,
    "paternity_leave_total": 14,
    "compassionate_leave_total": 7,
    "study_leave_total": 10,
    "rr_leave_total": 21,
    "unpaid_leave_used": 0,
    "summary": {
      "annual_available": 23,
      "sick_available": 13,
      "total_used": 6
    }
  }
}
```

---

### **Admin Endpoints**

#### Get All Leave Balances

```http
GET /api/v1/admin/leave-balances
Authorization: Bearer {admin_token}
```

**Query Parameters:**

- `year` (optional): Filter by year
- `search` (optional): Search by staff name or ID
- `department` (optional): Filter by department

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "year": 2026,
      "annual_leave_total": 30,
      "annual_leave_used": 5,
      "user": {
        "id": "uuid",
        "staff_id": "STF001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Get User Leave Balance

```http
GET /api/v1/admin/leave-balances/:userId
Authorization: Bearer {admin_token}
```

**Response:** Same as "Get My Leave Balance"

#### Initialize Leave Balance

```http
POST /api/v1/admin/leave-balances/:userId/initialize
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "year": 2026
}
```

**Response:**

```json
{
  "success": true,
  "message": "Leave balance initialized successfully",
  "data": {
    "id": "uuid",
    "year": 2026,
    "annual_leave_total": 30,
    "annual_leave_carryover": 3
  }
}
```

#### Update Leave Balance

```http
PATCH /api/v1/admin/leave-balances/:userId
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "year": 2026,
  "annual_leave_total": 35,
  "sick_leave_total": 20
}
```

**Response:**

```json
{
  "success": true,
  "message": "Leave balance updated successfully",
  "data": {
    "id": "uuid",
    "annual_leave_total": 35,
    "sick_leave_total": 20
  }
}
```

---

## 💰 **GRANT ENDPOINTS**

### **Staff Endpoints**

#### Get My Grants

```http
GET /api/v1/finance/grants
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 5000,
      "category": "Education",
      "reason": "Professional certification",
      "status": "pending",
      "created_at": "2026-01-31T07:00:00Z"
    }
  ]
}
```

#### Apply for Grant

```http
POST /api/v1/finance/grants
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 5000,
  "category": "Education",
  "reason": "Professional certification course"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Grant application submitted successfully",
  "data": {
    "id": "uuid",
    "amount": 5000,
    "category": "Education",
    "status": "pending",
    "created_at": "2026-01-31T07:00:00Z"
  }
}
```

#### Get Grant Details

```http
GET /api/v1/finance/grants/:id
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 5000,
    "category": "Education",
    "reason": "Professional certification",
    "status": "approved",
    "approved_at": "2026-01-31T08:00:00Z",
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

#### Cancel Grant Application

```http
DELETE /api/v1/finance/grants/:id
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "Grant application cancelled successfully"
}
```

---

### **Admin Endpoints**

#### Get All Grants

```http
GET /api/v1/admin/grants
Authorization: Bearer {admin_token}
```

**Query Parameters:**

- `status` (optional): Filter by status (pending, approved, rejected, disbursed)
- `search` (optional): Search by staff name or ID
- `category` (optional): Filter by category

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 5000,
      "category": "Education",
      "status": "pending",
      "user": {
        "id": "uuid",
        "staff_id": "STF001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "created_at": "2026-01-31T07:00:00Z"
    }
  ]
}
```

#### Get Grant Statistics

```http
GET /api/v1/admin/grants/stats
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 25,
    "approved": 80,
    "rejected": 20,
    "disbursed": 75,
    "totalAmount": 750000,
    "totalDisbursed": 375000
  }
}
```

#### Bulk Approve Grants

```http
POST /api/v1/admin/grants/bulk-approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "grantIds": [
    "uuid1",
    "uuid2",
    "uuid3"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk approval completed",
  "data": [
    {
      "status": "fulfilled",
      "value": {
        "id": "uuid1",
        "status": "approved"
      }
    }
  ]
}
```

#### Get Grant Details (Admin)

```http
GET /api/v1/admin/grants/:id
Authorization: Bearer {admin_token}
```

**Response:** Same as staff endpoint but includes full user profile

#### Approve Grant

```http
POST /api/v1/admin/grants/:id/approve
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Grant approved successfully",
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_by": "admin_uuid",
    "approved_at": "2026-01-31T08:00:00Z"
  }
}
```

#### Reject Grant

```http
POST /api/v1/admin/grants/:id/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Insufficient budget allocation for this quarter"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Grant rejected",
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejected_by": "admin_uuid",
    "rejection_reason": "Insufficient budget allocation for this quarter"
  }
}
```

#### Disburse Grant

```http
POST /api/v1/admin/grants/:id/disburse
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "message": "Grant marked as disbursed",
  "data": {
    "id": "uuid",
    "status": "disbursed"
  }
}
```

---

## 🔐 **AUTHENTICATION**

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Admin endpoints** additionally require the user to have admin role.

---

## ⚠️ **ERROR RESPONSES**

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📧 **EMAIL NOTIFICATIONS**

### Leave Balance

- No automatic emails (integrated with application module)

### Grants

- **Application Submitted:** Sent to staff when grant is applied
- **Grant Approved:** Sent to staff when admin approves
- **Grant Rejected:** Sent to staff when admin rejects (includes reason)

---

## 🧪 **TESTING WITH CURL**

### Get Leave Balance

```bash
curl -X GET http://localhost:3000/api/v1/staff/leave-balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Apply for Grant

```bash
curl -X POST http://localhost:3000/api/v1/finance/grants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "category": "Education",
    "reason": "Professional certification"
  }'
```

### Approve Grant (Admin)

```bash
curl -X POST http://localhost:3000/api/v1/admin/grants/GRANT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📊 **GRANT CATEGORIES**

Common grant categories:

- `Education` - Training, courses, certifications
- `Medical` - Medical expenses
- `Housing` - Housing assistance
- `Emergency` - Emergency financial assistance
- `Equipment` - Work equipment
- `Other` - Other categories

---

## 🎯 **LEAVE TYPES**

Supported leave types:

- `annual_leave` - Annual vacation leave
- `sick_leave` - Sick leave
- `maternity_leave` - Maternity leave (90 days)
- `paternity_leave` - Paternity leave (14 days)
- `compassionate_leave` - Compassionate/bereavement leave
- `study_leave` - Study leave
- `rr_leave` - R&R leave (for field staff)
- `unpaid_leave` - Unpaid leave

---

## 🔗 **RELATED ENDPOINTS**

### Integration Points

**Leave Balance** integrates with:

- `POST /api/v1/applications` - Leave applications deduct from balance
- `PATCH /api/v1/admin/applications/:id/decision` - Approval updates balance

**Grants** are standalone but may integrate with:

- Payroll system (future)
- Financial reporting (future)

---

**Last Updated:** January 31, 2026, 07:30 AM  
**API Version:** 1.0  
**Base URL:** `http://localhost:3000/api/v1`
