# ShopFlow Build Log

## Phase 0: Scaffold
- **Built**: Next.js 14 App Router, TypeScript strict, Tailwind CSS, Prisma 5, Vitest, Playwright, Dockerfile & docker-compose.yml (PostgreSQL 16 + Next.js app), `.env.example`.
- **Checks Run**:
  - `docker compose up -d`
  - Health endpoint `GET /api/health` -> HTTP 200 `{ "ok": true, "database": "connected" }`.
- **Result**: PASS

## Phase 1: Schema and Seed
- **Built**: `prisma/schema.prisma` with 13 models, PostgreSQL sequence `refund_ticket_seq`, 15 catalog items, 15 refund policies, 10 customers + 2 staff accounts, 29 orders, 24 historical tickets (`RIT-2026-000090`..`000120`), audit events, decisions, and transactions.
- **Checks Run**:
  - `npm run db:seed`
  - Verification query: Next ticket sequence preview = `RIT-2026-000123`.
  - Product count = 15; Customers = 10; Staff = 2.
- **Result**: PASS

## Phase 2: Auth, Catalog, Cart, Checkout
- **Built**: Iron-session cookie auth + DB sessions, password hashing (`bcryptjs`), role guards, catalog list with search/filter/sort, product details with structured policy panel, shopping cart service, mock payment provider with `fail@mock` simulation, UPI/card checkout.
- **Checks Run**:
  - Vitest: `tests/unit/auth-payment.test.ts`, `tests/unit/phase2-acceptance.test.ts`.
  - Aarav UPI checkout for PROD-001 persisted in PostgreSQL; `fail@mock` declined without confirmed order.
- **Result**: PASS (3/3 tests passed)

## Phase 3: Orders and Admin Controls
- **Built**: Customer `/orders` and `/orders/[id]`, admin `/admin/orders` management, `/api/admin/orders/[id]/status`, `/api/admin/orders/[id]/simulate-delivery`, refund button eligibility gate on delivered orders.
- **Checks Run**:
  - Vitest: `tests/unit/phase3-acceptance.test.ts`.
  - Admin simulated delivery 4 days ago -> customer view derived `is_eligible_for_refund: true` and rendered "Request Refund" action.
- **Result**: PASS (1/1 test passed)

## Phase 4: Refund Tickets and Evidence
- **Built**: Refund ticket submission API `POST /api/me/orders/[id]/refund-tickets`, evidence storage with MIME/size/SHA256 hash checks, state machine `assertValidTransition` and `transitionTicket`, audit events trail, outbox dispatcher `refund.ticket.created` event emission, sanitized customer timeline API.
- **Checks Run**:
  - Vitest: `tests/unit/phase4-acceptance.test.ts`.
  - Next ticket sequence preview verified as `RIT-2026-000123`.
  - State machine allows legal transitions and throws `IllegalTransitionError` for illegal jumps (e.g. `REFUNDED` -> `APPROVED`).
  - Evidence validator accepts valid images/PDFs and computes SHA-256; rejects disallowed types.
  - Integration event outbox row persisted with status `PENDING`.
- **Result**: PASS (3/3 tests passed)

## Phase 5: RITOS Read API and Contract
- **Built**: RITOS API-key authentication (`Authorization: Bearer <RITOS_API_KEY>`), full refund context builder per docs/02 §1 (`GET /api/ritos/refund-tickets/:ticketId/context` and alias `GET /api/refunds/:ticketId/context`), evidence download streaming (`GET /api/ritos/evidence/:evidenceId/download`), resource endpoints (`/api/orders/:id/details`, `/api/orders/:id/refund-eligibility`, `/api/customers/:id`, `/api/customers/:id/refund-history`, `/api/products/:id/refund-policy`, `/api/transactions/:transactionId`, `/api/refunds/:ticketId`, `/api/refunds`), and dev helper script `scripts/ritos-client.ts`.
- **Checks Run**:
  - Contract & Scenario Vitest: `tests/unit/phase5-acceptance.test.ts`.
  - Zod validation of Context against strict docs/02 §1 schema: PASS.
  - Scenario 4: `within_return_window = false`: PASS.
  - Scenario 7: `related_tickets` includes REFUNDED sibling `RIT-2026-000111` and `remaining_refundable_minor = 0`: PASS.
  - Scenario 8: `claim_data_conflicts` detects mismatch between `ORDER_NEVER_ARRIVED` and order `DELIVERED`: PASS.
  - `npx tsc --noEmit` and `npm run lint`: PASS.
- **Result**: PASS (4/4 tests passed)
