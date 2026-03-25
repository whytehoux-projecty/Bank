# AURUM VAULT API Reference

## Authentication (`/api/auth`)

- **POST /register**: Register a new user.
  - Body: `email`, `password`, `firstName`, `lastName`, `dateOfBirth`, `address` (optional).
- **POST /login**: Authenticate user.
  - Body: `email` OR `accountNumber`, `password`.
  - Returns: `accessToken`, `refreshToken`, `user` object.
- **POST /refresh**: Refresh access token.
  - Body: `refreshToken`.
- **POST /logout**: Logout user (invalidates session).
- **GET /me**: Get current user profile.

## Accounts (`/api/accounts`)

- **GET /**: List all accounts for the user.
- **POST /**: Create a new account.
  - Body: `accountType` (CHECKING/SAVINGS/INVESTMENT/CREDIT), `currency`, `initialDeposit`.
- **GET /:accountId**: Get details of a specific account.
- **PATCH /:accountId**: Update account settings (`status`, limits).
- **GET /:accountId/balance**: Get account balance and pending transactions.
- **GET /:accountId/transactions**: Get paginated transactions for an account.

## Transactions (`/api/transactions`)

- **GET /**: List all transactions (filterable by `accountId`, `type`, `status`, date).
- **GET /:transactionId**: Get details of a transaction.
- **POST /deposit**: Create a deposit (Internal/ATM simulation).
- **POST /withdrawal**: Create a withdrawal.
- **POST /transfer**: Transfer funds between accounts.
- **GET /stats**: Get transaction statistics (volume, aggregation by type).

## KYC (`/api/kyc`)

- **GET /**: List documents.
- **POST /**: Upload document (multipart).
- **GET /status**: Get current KYC status.

## Wire Transfers (`/api/wire-transfers`)

- **GET /**: List wire transfers.
- **POST /**: Initiate a wire transfer.
- **GET /fees**: Get fee structure.

## Admin Config (Internal)

- **GET /api/system/health**: System health check.
