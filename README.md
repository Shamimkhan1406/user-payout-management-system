# User Payout Management System

A backend system for managing user earnings, advance payouts, sale reconciliation, and withdrawals using a ledger-based accounting model.

Built with **Node.js**, **Express.js**, **PostgreSQL**, **Prisma ORM**, **Jest**, and **Supertest**.

---

## Features

- User Management
- Sale Management
- Automatic Advance Payout (10%)
- Sale Reconciliation
- Ledger-Based Accounting
- Withdrawal Management
- 24-Hour Withdrawal Restriction
- Recovery for Failed/Rejected Withdrawals
- Prisma Transactions
- Zod Validation
- Integration Tests

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | REST API |
| PostgreSQL | Database |
| Prisma ORM | Database ORM |
| Zod | Request Validation |
| Jest | Testing |
| Supertest | API Integration Testing |

---

# Project Structure

```
src
│
├── config
│   └── prisma.js
│
├── controllers
│
├── middleware
│
├── repositories
│
├── routes
│
├── services
│
├── validators
│
└── app.js

tests
│
├── user.api.test.js
├── sale.api.test.js
├── payout.api.test.js
├── reconciliation.api.test.js
└── withdrawal.api.test.js
```

---

# Database Design

## User

Stores platform users.

Fields

- id
- username
- email
- createdAt

---

## Sale

Represents an affiliate sale.

Fields

- id
- userId
- brand
- earning
- status
- advancePaid
- advanceAmount
- reconciledAt

Status

- PENDING
- APPROVED
- REJECTED

---

## Withdrawal

Stores withdrawal requests.

Fields

- id
- userId
- amount
- status
- processedAt

Status

- PENDING
- COMPLETED
- FAILED
- CANCELLED
- REJECTED

---

## Ledger

Maintains every financial transaction.

Ledger Types

- ADVANCE_PAYOUT
- FINAL_PAYOUT
- WITHDRAWAL
- FAILED_RECOVERY
- REJECTED_ADJUSTMENT

The available balance is always calculated from ledger entries rather than stored separately.

---

# Business Flow

## 1. Create User

↓

## 2. Create Sale

↓

Sale Status = PENDING

↓

## 3. Advance Payout Job

Eligible sales receive

```
Advance = 10% of earning
```

↓

Ledger Entry

```
ADVANCE_PAYOUT
```

↓

## 4. Reconciliation

### Approved

```
Remaining Amount
=
Total Earning - Advance
```

Ledger Entry

```
FINAL_PAYOUT
```

---

### Rejected

Advance is reversed.

Ledger Entry

```
REJECTED_ADJUSTMENT
```

---

## 5. Withdrawal

Balance is calculated using Ledger.

Checks

- Sufficient balance
- 24-hour cooldown

Creates

```
WITHDRAWAL
```

ledger entry.

---

## 6. Failed Withdrawal

If withdrawal becomes

- FAILED
- CANCELLED
- REJECTED

System automatically creates

```
FAILED_RECOVERY
```

ledger entry to restore user balance.

---

# API Endpoints

## User

POST

```
/api/users
```

Create user.

---

## Sale

POST

```
/api/sales
```

Create sale.

---

## Advance Payout

POST

```
/api/jobs/advance-payout
```

Run advance payout job.

---

## Reconciliation

POST

```
/api/reconciliation
```

Approve or reject sale.

---

## Withdrawal

POST

```
/api/withdrawals
```

Create withdrawal.

PATCH

```
/api/withdrawals/:id/status
```

Update withdrawal status.

---

# Running the Project

Install dependencies

```bash
npm install
```

Create environment variables

```
DATABASE_URL=your_database_url
PORT=3000
```

Run Prisma migrations

```bash
npx prisma migrate deploy
```

Generate Prisma Client

```bash
npx prisma generate
```

Start the server

```bash
npm run dev
```

---

# Running Tests

Execute all integration tests.

```bash
npx jest --runInBand
```

---

# Test Coverage

Integration tests cover:

- User creation
- Duplicate user validation
- Sale creation
- Invalid sale requests
- Advance payout processing
- Idempotent payout execution
- Sale reconciliation
- Final payout
- Rejected sale recovery
- Withdrawal creation
- Insufficient balance
- 24-hour withdrawal restriction
- Failed withdrawal recovery
- Cancelled withdrawal recovery
- Rejected withdrawal recovery

Total Tests

```
17 Passing
```

---

# Design Decisions

- Repository pattern separates database access from business logic.
- Service layer contains all business rules.
- Ledger-based accounting ensures financial operations are auditable.
- Prisma transactions guarantee atomic financial updates.
- Zod validates every incoming request before reaching controllers.
- Integration tests verify complete API workflows against a real PostgreSQL database.

---

# Future Improvements

- JWT Authentication
- Background job scheduler (Cron/BullMQ)
- Pagination and filtering
- API rate limiting
- Logging and monitoring
- Docker Compose for one-command setup
- CI/CD pipeline with GitHub Actions

---

# Author

**Shamim Khan**

Backend Developer
