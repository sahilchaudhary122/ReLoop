# ReLoop — Master Engineering Instructions

## 1. PROJECT

ReLoop is an offline-first digital platform for India's informal e-waste collection ecosystem.

The platform connects informal e-waste collectors to formal aggregators, recyclers/refurbishers and EPR/compliance workflows.

Core flow:

Citizen
→ Pickup Request
→ Collector
→ Collection
→ Collection Batch
→ Aggregator Verification
→ Sorting
→ Recycler/Refurbisher
→ Processing
→ EPR Eligibility
→ EPR Credit
→ Brand/PRO Dashboard

The project is collector-first, offline-first and backend-authoritative.

---

# 2. NON-NEGOTIABLE TECHNOLOGY STACK

## Collector Mobile

- Flutter
- Dart
- SQLite

## Web

- Next.js
- React
- TypeScript

## Backend

- Python
- FastAPI

## Database

- PostgreSQL
- Supabase may be used as the managed PostgreSQL platform

## ORM / Migrations

- SQLAlchemy
- Alembic

## Storage

- Supabase Storage or S3-compatible object storage

## Authentication

- JWT
- RBAC

## QR

- Standard QR generation/scanning libraries

## Location

- Device GPS/location services

## Maps

- Leaflet
- OpenStreetMap

## Notifications

- Firebase Cloud Messaging

## Deployment

- Vercel
- Render/Railway
- Supabase

## Architecture

- Modular monolith

---

# 3. FORBIDDEN TECHNOLOGIES

Do NOT introduce these unless explicitly approved:

- Microservices
- Blockchain
- MongoDB
- Firebase as primary database
- Django
- Node.js backend
- Express backend
- another mobile framework
- another frontend framework
- Kubernetes
- custom ML infrastructure
- custom AI models
- unnecessary third-party infrastructure

Do not replace an approved technology with another technology because it appears easier.

---

# 4. AI POLICY

AI is NOT the core of ReLoop.

Core functionality must work without AI.

AI must NOT be required for:

- pickup requests
- collector workflow
- offline collection
- SQLite
- photo capture
- GPS
- weight
- batch creation
- QR
- aggregator verification
- recycler confirmation
- rewards
- wallet
- trust score
- risk/anomaly detection
- hazard reporting
- EPR eligibility
- compliance reporting

AI is optional and may primarily be used for Circularity / Smart Route intelligence.

The deterministic Smart Route system must work without AI.

Do not add AI simply because an AI API is available.

---

# 5. ARCHITECTURE

The canonical architecture is:

Citizen
↓
WhatsApp/Web
↓
FastAPI Backend
↓
PostgreSQL/Supabase
↓
Flutter Collector App
Next.js Web Application
Recycler Portal
Brand/PRO Portal

The backend is the authoritative business-data layer.

---

# 6. USER ROLES

Canonical roles:

- CITIZEN
- COLLECTOR
- AGGREGATOR
- RECYCLER
- BRAND
- PRO
- ADMIN

Never create alternative role names without approval.

---

# 7. IDENTITY MODEL

Pickup Request:

PR-1024

Individual Item:

RL-000421

Collection Batch:

CB-00071

Transaction/Event:

TX-001

QR identifies an item or batch.

Events represent movement and verification.

Do NOT create a new QR code for every transaction.

Use batch-first tracking wherever practical.

---

# 8. BATCH MODEL

A pickup may contain multiple items.

Example:

2 Mobile
1 Laptop
1 Printer
3 Chargers

↓

Collection Batch CB-00071

One batch QR may represent the collection.

Individual item tracking is allowed for high-value or special items.

Batches may be split:

CB-00071
├── CB-00071-A → Refurbishment
└── CB-00071-B → Recycling

Parent-child relationships must be preserved.

---

# 9. LIFECYCLE

Canonical lifecycle:

REQUESTED
→ ASSIGNED
→ COLLECTED
→ AGGREGATOR_RECEIVED
→ SORTED
→ RECYCLER_RECEIVED
→ PROCESSED
→ EPR_ELIGIBLE
→ EPR_CREDIT

Alternative pathways:

SORTED
→ REFURBISHED
→ REUSED

SORTED
→ COMPONENT_RECOVERY
→ RECYCLE

The backend controls lifecycle transitions.

Invalid transitions must be rejected.

COLLECTED does NOT mean RECYCLED.

---

# 10. WEIGHT MODEL

Never overwrite historical weight measurements.

Store:

- declared_weight
- verified_weight
- received_weight

Example:

Declared: 12.4 kg
Verified: 11.9 kg
Received: 11.7 kg

---

# 11. EVENT LEDGER

Important lifecycle actions must create events.

Examples:

- COLLECTION_CREATED
- AGGREGATOR_RECEIVED
- WEIGHT_VERIFIED
- SORTED
- RECYCLER_RECEIVED
- PROCESSING_CONFIRMED
- EPR_ELIGIBILITY_CREATED
- EPR_CREDIT_CREATED
- REWARD_CREATED
- RISK_FLAGGED
- HAZARD_REPORTED

Important history must remain auditable.

Do not casually delete historical events.

---

# 12. OFFLINE-FIRST

The Collector App MUST work without internet.

Architecture:

Flutter
↓
SQLite
↓
Pending Queue
↓
Internet Available
↓
FastAPI
↓
PostgreSQL

Every locally created transaction must have:

client_transaction_id

Use UUIDs.

Synchronization must be idempotent.

Retries must never create duplicate records.

Do not delete local records until server acknowledgement.

---

# 13. DATABASE

Canonical entities:

- users
- pickup_requests
- items
- batches
- events
- verifications
- partners
- inventory
- hazards
- risk_flags
- rewards
- epr_records
- notifications

Use:

- PostgreSQL
- SQLAlchemy
- Alembic

---

# 14. BACKEND ARCHITECTURE

Use:

FastAPI
↓
API Layer
↓
Service Layer
↓
Repository Layer
↓
PostgreSQL

Business rules belong in backend services.

Do not put critical business logic only in frontend code.

---

# 15. SECURITY

Use:

- HTTPS
- JWT
- RBAC
- input validation
- server-side authorization
- secure token handling
- file validation
- file size limits
- rate limiting where appropriate
- audit logging
- database constraints

Never trust client-provided:

- role
- user_id
- reward amount
- EPR eligibility
- lifecycle state

Never hard-code secrets.

Never commit real `.env` files.

---

# 16. RISK / ANOMALY DETECTION

Initial system is rule-based.

Possible rules:

- duplicate transaction
- duplicate/similar photo
- abnormal weight difference
- GPS anomaly
- suspicious activity pattern

Lifecycle:

NORMAL
→ RISK_FLAGGED
→ MANUAL_REVIEW
→ CLEARED

or:

MANUAL_REVIEW
→ REJECTED

Do not claim perfect fraud prevention.

Use the term:

"risk/anomaly detection"

---

# 17. HAZARD REPORTING

Supported hazard examples:

- swollen battery
- damaged battery
- leakage
- unknown hazard
- no hazard

Hazards must be associated with the relevant item/batch.

---

# 18. SMART ROUTE

Smart Route answers:

"Where should this material go next?"

Use deterministic scoring initially:

route_score =
value_score
+
distance_score
+
trust_score
+
material_compatibility_score
+
capacity_score

The recommendation must be explainable.

AI may later improve the recommendation but is not required.

---

# 19. REWARDS

Rewards may include:

- base collection points
- verification bonus
- accuracy bonus
- downstream bonus
- reliability bonus

The backend calculates final rewards.

The frontend displays them.

---

# 20. TRUST SCORE

Trust Score is deterministic initially.

Possible factors:

- verified collections
- weight accuracy
- successful handovers
- verification rate
- risk flags

Example:

Trust Score: 94/100

The score should be explainable.

---

# 21. EPR RULE

EPR credit MUST NOT be created simply because a collector submitted a collection.

Required chain:

Collector Collection
↓
Aggregator Verification
↓
Recycler Receipt
↓
Processing Confirmation
↓
EPR Eligibility
↓
EPR Credit

COLLECTED ≠ RECYCLED.

---

# 22. COMPLIANCE

Brand/PRO dashboard may show:

- EPR obligation
- verified downstream quantity
- fulfillment percentage
- informal-channel attribution
- reuse
- refurbishment
- recycling

Reports must derive data from actual platform records.

Use:

"compliance-ready report"

or:

"CPCB-ready report"

Do NOT claim that ReLoop automatically issues an official CPCB certificate.

---

# 23. REPOSITORY STRUCTURE

Canonical structure:

ReLoop/
├── GEMINI.md
├── README.md
├── .gitignore
│
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-contract.md
│   ├── state-machine.md
│   ├── event-types.md
│   ├── roles-permissions.md
│   └── integration-guide.md
│
├── backend/
├── collector_app/
└── web/

Backend:

backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── core/
│   └── main.py
└── tests/

---

# 24. TEAM OWNERSHIP

Member 1:

Backend + Database + Core Business Logic + API Contracts

Member 2:

Flutter Collector App + SQLite + Offline UX

Member 3:

Next.js Web + Aggregator + Recycler + Brand/PRO + Admin

Member 1 owns canonical backend contracts.

Member 2 and Member 3 consume documented APIs.

Do not create alternative backend implementations.

---

# 25. SHARED CONTRACTS

The following are shared contracts:

- database schema
- API request/response structures
- entity IDs
- lifecycle states
- event types
- roles
- permissions
- repository structure
- naming conventions

Before changing a shared contract:

1. Check existing implementation.
2. Identify affected modules.
3. Explain the change.
4. Update all affected consumers.
5. Update tests.
6. Document the change.

Never silently break another module.

---

# 26. DEVELOPMENT PROCESS

Before coding:

1. Read GEMINI.md.
2. Read relevant docs/.
3. Inspect repository.
4. Inspect existing code.
5. Check dependencies.
6. Check existing abstractions.
7. Create an implementation plan.
8. Identify affected modules.
9. Implement only after understanding the architecture.

Do not rewrite unrelated code.

Do not create duplicate implementations.

Do not introduce new technologies without approval.

---

# 27. GIT RULES

Do not directly modify main unless explicitly instructed.

Development branches:

Member 1 → backend-dev
Member 2 → collector-dev
Member 3 → web-dev

Normal workflow:

branch
↓
implementation
↓
tests
↓
commit
↓
push
↓
Pull Request
↓
review
↓
main

Do not automatically merge branches.

Do not force push shared branches.

---

# 28. CODE QUALITY

Prioritize:

- correctness
- simplicity
- maintainability
- testability
- security
- clear naming

Avoid unnecessary abstraction.

Avoid over-engineering.

---

# 29. TESTING

Test:

- authentication
- authorization
- lifecycle transitions
- pickup
- collection
- batch
- verification
- recycler processing
- EPR eligibility
- rewards
- risk rules
- offline synchronization
- duplicate transaction prevention

Full E2E flow:

Citizen
→ Pickup
→ Collector
→ Offline Collection
→ Batch
→ Aggregator
→ Recycler
→ Processing
→ EPR
→ Brand Dashboard

---

# 30. FINAL RULE

Do not optimize an individual task at the expense of the entire ReLoop system.

Every implementation must fit:

Product Model
+
Technical Stack
+
Database Model
+
API Contract
+
Lifecycle
+
Security
+
Offline Architecture
+
UI Conventions

The goal is for multiple human developers and AI agents to produce one consistent codebase.

When uncertain, choose the simplest implementation that preserves the existing architecture.