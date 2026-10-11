# ShopFlow

ShopFlow is the customer-facing e-commerce platform and **System of Record** for **RITOS** (Refund Intelligence & Orchestration System).

## Quick Start

### 1. Start Services
```bash
docker compose up -d
```

### 2. Seed Database
```bash
npm run db:seed
```

### 3. Verify Health
```bash
curl http://localhost:3000/api/health
```

## Architecture & Boundaries
* **ShopFlow**: System of record for customers, products, policies, orders, payments, tickets, evidence, notifications, audit events, and idempotent refund execution.
* **RITOS**: External AI orchestrator for claim comprehension, verification, policy reasoning, risk & fraud scoring, confidence calculation, and refund decisions.

## Demo Accounts
* Customer: `aarav@example.com` / `Demo@1234`
* Support Analyst: `support@shopflow.test` / `Demo@1234`
* System Admin: `admin@shopflow.test` / `Demo@1234`
