# 📡 API Specification

This document defines the RESTful API endpoints for the Staff Portal.
**Base URL**: `/api/v1`

## 1. Authentication

### `POST /auth/login`

Authenticate a user and receive a JWT token.

* **Body**: `{ "staffId": "STAFF001", "password": "..." }`
* **Response (200)**:

    ```json
    {
      "token": "eyJhbG...",
      "user": { "id": "...", "name": "John Doe", "role": "staff" }
    }
    ```

### `POST /auth/refresh`

Refresh an expired access token using a refresh token (httpOnly cookie).

### `POST /auth/logout`

Invalidate current session.

## 2. Staff Management

### `GET /staff/profile`

Get currently logged-in user's profile.

* **Headers**: `Authorization: Bearer <token>`
* **Response (200)**: User object with sensitive fields redacted.

### `PUT /staff/profile`

Update contact information (email, phone).

### `GET /staff/employment`

Get employment history and current contract details.

* **Response (200)**:

    ```json
    {
      "currentContract": { ... },
      "history": [ ... ],
      "supervisor": { "name": "Jane Smith" }
    }
    ```

## 3. Finance Module

### `GET /finance/payroll`

Get list of monthly payslips.

* **Query Params**: `?year=2024`
* **Response (200)**: Array of payroll records.

### `GET /finance/payroll/:id/pdf`

Download a specific payslip as PDF.

### `GET /finance/loans`

Get active and past loans.

### `GET /finance/benefits`

Get enrolled benefits summary.

## 4. Applications (Workflow)

### `GET /applications`

List all applications submitted by the user.

* **Query Params**: `?status=pending|approved`

### `POST /applications`

Submit a new request.

* **Body**:

    ```json
    {
      "type": "leave",
      "data": {
        "startDate": "2024-12-20",
        "endDate": "2024-12-27",
        "reason": "Family vacation"
      }
    }
    ```

### `GET /applications/:id`

Get details of a specific application.

### `DELETE /applications/:id`

Cancel a pending application.

## 5. Admin Routes (Role: 'admin' or 'hr')

### `GET /admin/users`

List all staff members with pagination and filtering.

### `POST /admin/users`

Create a new staff account.

### `GET /admin/applications/pending`

Get all applications requiring approval.

### `PUT /admin/applications/:id/decide`

Approve or Reject an application.

* **Body**: `{ "decision": "approved", "comment": "Approved per policy." }`

### `POST /admin/payroll/process`

Trigger monthly payroll calculation.

## 6. System Configuration (Dynamic Branding)

### `GET /config/public`

Get public portal settings (Logo, Title) for the frontend to render.

* **Auth**: Public (No token required)
* **Response (200)**:

    ```json
    {
      "logoUrl": "https://s3.aws.../logo.png",
      "portalName": "Global Relief Portal",
      "primaryColor": "#0066CC"
    }
    ```

### `PUT /admin/config`

Update portal branding and settings.

* **Body**: `{ "logoUrl": "...", "portalName": "..." }`
* **Response (200)**: Updated settings.

### `POST /admin/config/logo`

Upload a new logo image file.

* **Content-Type**: `multipart/form-data`
* **Response (200)**: `{ "url": "https://..." }`

## 7. Error Handling

Standard HTTP status codes are used:

* `200` OK
* `201` Created
* `400` Bad Request (Validation Error)
* `401` Unauthorized (Invalid/Missing Token)
* `403` Forbidden (Insufficient Permissions)
* `404` Not Found
* `500` Internal Server Error

**Error Response Format**:

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Start date cannot be in the past",
  "details": [ ... ]
}
```
