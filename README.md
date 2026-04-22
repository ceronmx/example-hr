# ExampleHR: Time-Off Microservice

[![Coverage](https://img.shields.io/badge/Coverage-85.6%25-brightgreen.svg)](./docs/testing/coverage.png)
[![Postman](https://img.shields.io/badge/Postman-Collection-orange.svg)](./docs/postman/ExampleHR-Time-Off-Microservice.postman_collection.json)

ExampleHR is a production-ready Time-Off Microservice built with **Hexagonal Architecture** and NestJS. It is designed to handle high-concurrency requests and maintain synchronization with external HCM (Human Capital Management) systems.

---

## 🏛 Architecture Overview

This project follows a strict **Hexagonal Architecture (Ports & Adapters)** pattern to ensure the business logic remains independent of external drivers:

-   **Domain Layer:** Pure business entities, state machine transitions, and custom exceptions.
-   **Application Layer:** Use cases (Interactors) that orchestrate the domain logic and define ports (Interfaces).
-   **Infrastructure Layer:** External adapters (TypeORM for SQLite, Fetch for HCM Client, NestJS Controllers).

For a deep dive into the design decisions, see the [Technical Requirement Document (TRD)](./docs/trd/TRD.md).

---

## ✨ Strategic Features

### 1. Defensive "Projected Balance" Calculation
Employees receive instant feedback. The system calculates available days locally:
`Available = HCM_Balance - (Pending + Approved + Syncing)`
This prevents "double-spending" even before the external HCM has updated.

### 2. Reliable State Machine
Requests follow a validated lifecycle:
`PENDING_APPROVAL` → `APPROVED` → `SYNCING` → `SYNCED`
This prevents illegal transitions and ensures data integrity.

### 3. Idempotent HCM Syncing
Every request sent to the HCM system includes a domain-generated `idempotencyKey`, ensuring that network retries never result in double-deductions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v25+
- pnpm

### Installation
```bash
pnpm install
```

### Running the System
1. **Start the Mock HCM Server** (Essential for external API integration):
   ```bash
   pnpm run hcm:mock
   ```
2. **Start the Microservice** (In a new terminal):
   ```bash
   pnpm run start:dev
   ```

---

## 🧪 Testing

The system is built with a "Quality First" mindset:
- **Domain Layer:** 100% Code Coverage.
- **E2E Suite:** Covers full happy paths, double-spending protection, and idempotency.

```bash
# Run Unit Tests
pnpm run test

# Run E2E Integration Tests
pnpm run test:e2e

# Generate Coverage Report
pnpm run test:cov
```

---

## 📊 Reviewer Test Data (Mock HCM)

Use these IDs for manual testing via Swagger (`http://localhost:3000/api/docs`) or Postman:

| Entity | ID | Notes |
| :--- | :--- | :--- |
| **Employee** | `EMP-001` | Initial Balance: 25.0 |
| **Employee** | `EMP-002` | Initial Balance: 10.0 |
| **Location** | `LOC-001` | Default Test Location |
| **Leave Type** | `VACATION` | Standard Type |

---

## 🛠 Integration

- **Postman Collection:** Found in `./docs/postman/ExampleHR-Time-Off-Microservice.postman_collection.json`.
- **Swagger Documentation:** Available at `http://localhost:3000/api/docs` when the app is running.

---

## 🔐 Security Disclaimer
For the scope of this technical challenge, Authentication and Authorization (IAM/OAuth2) have been omitted. In a production environment, a robust middleware layer for Identity and Access Management would be mandatory.

---

**ExampleHR** - *Resilient HR Engineering.*
