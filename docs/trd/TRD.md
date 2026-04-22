# Technical Requirement Document (TRD) - ExampleHR Time-Off Microservice

## Overview
ExampleHR is a high-resilience Time-Off Microservice designed to integrate with external HCM (Human Capital Management) systems. This document outlines the key technical challenges addressed and the architectural decisions that ensure reliability, accuracy, and scalability.

## HCM Integration Challenges & Solutions

### 1. External Updates (The Anniversary Problem)
**Challenge:** External HCM systems often update employee balances automatically (e.g., on work anniversaries or policy changes) without notifying the microservice in real-time.
**Solution:** **Batch Reconciliation Logic**.
The service implements a dedicated reconciliation use case (`SyncBatchBalancesUseCase`) that performs a mass upsert of balances from the HCM. This ensures that the local "Source of Truth" for balance inquiry eventually matches the master HCM system, accounting for any silent updates.

### 2. Real-time API vs. Data Drift
**Challenge:** Creating a request involves multiple steps (Approval, Syncing) where the HCM state might change mid-process.
**Solution:** **Idempotency Keys & FSM**.
- **Idempotency:** Every transaction with the HCM is protected by a unique `idempotencyKey` generated at the domain layer. This prevents double-deductions in case of network retries.
- **Finite State Machine (FSM):** Requests follow a strict state transition model (`PENDING_APPROVAL` -> `APPROVED` -> `SYNCING` -> `SYNCED`). Transitions are validated at the domain level, preventing logical corruption (e.g., approving a rejected request).

### 3. Unreliable HCM Validation
**Challenge:** The external HCM might accept a request even if it exceeds local constraints, or fail silently.
**Solution:** **Defensive "Projected Balance" Algorithm**.
To provide instant and accurate feedback to employees, the service does not rely solely on the HCM's current number. It calculates the **Projected Balance**:
`Available = HCM_Balance - ∑(Pending + Approved + Syncing Requests)`
This ensures that "double-spending" of vacation days is blocked locally even before the HCM has processed the deduction.

---

## Architectural Strategy: Hexagonal (Ports & Adapters)

### Decoupling & Scalability
The project follows **Hexagonal Architecture**, which isolates the core business logic (Domain & Application) from external technologies (Infrastructure).

- **Domain Layer:** Contains the pure business rules (transitions, balance math) with 100% test coverage. It has zero dependencies on NestJS, TypeORM, or HTTP.
- **Infrastructure Layer:** Contains the adapters for SQLite (TypeORM) and the HCM Client (Fetch).

**Benefit:** The HCM provider can be swapped (e.g., from a REST Mock to a SOAP legacy system or a modern GraphQL API) by simply implementing the `IHcmClient` port. Not a single line of business logic would change.

### Facilitating Agentic Development
The strict separation of concerns was foundational for **Agentic Development** (AI-assisted engineering).
- **Isolated Verification:** The coding agent could verify complex business rules (like projected balance math) through pure unit tests in the Domain layer before external adapters were even built.
- **Contract-First:** Defining interfaces (Ports) allowed the AI to work on different layers in parallel, ensuring that the Infrastructure always adhered to the expectations of the Application layer.

---

## Conclusion
ExampleHR is built for the "Real World" where external systems are slow, flaky, and inconsistent. Through defensive algorithms, strict state management, and a clean hexagonal boundary, we provide a robust foundation for HR operations.
