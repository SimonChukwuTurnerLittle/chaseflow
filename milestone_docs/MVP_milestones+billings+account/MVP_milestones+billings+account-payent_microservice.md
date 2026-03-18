# ChaseFlow CRM — Project Audit & Task Roadmap


## Context

ChaseFlow is a multi-tenant CRM for managing leads, opportunities, chase sequences, AI-generated outreach drafts, and communications (email/SMS/WhatsApp). The project has been built over 6 commits from "Initial Product" to the current state. This audit catalogs what's complete, what's partially done, and produces a prioritized task list to reach MVP and full product completion.

---

## Current Milestones Achieved

### M1 — Initial Product (commit `1299b62`)
- Spring Boot backend with MySQL, JWT auth, multi-tenancy
- React frontend with routing, auth, layout
- Lead CRUD, Opportunity CRUD, Service/Category CRUD

### M2 — UUID & UI Updates (commit `2059638`)
- UUID-based IDs across all entities
- Frontend UI polish

### M3 — Backend Stabilization (commit `de2c28f`)
- Templates, services, chase sequences reviewed and hardened
- Template assignment/unassignment, duplication

### M4 — Opportunity Detail & Navigation (commit `073ed02`)
- Opportunity detail page with full layout
- Breadcrumb navigation
- Opportunity bug fixes

### M5 — Service Config Restructure (commit `8ad7f16`)
- Standalone template management
- Unified service config modal with side tabs (sequences + templates)

### M6 — Search, Filters & Docs (commit `9f7610b` — current)
- Lead search/filter (search, source, rating, dates)
- Opportunity search/filter (search, status, temperature, service, dates)
- Swagger UI documentation
- Request logging filter
- Global exception handler improvements

---

## What's Built & Working

| Area | Status | Details |
|------|--------|---------|
| **Auth** | Complete | Register, login, JWT, role-based access (ADMIN, SALES_HANDLER, SALES_USER, EXPLORER) |
| **Multi-tenancy** | Complete | ThreadLocal TenantContext, all queries tenant-scoped |
| **Leads CRUD** | Complete | Create, read, update, soft-delete, search/filter, pagination |
| **Lead Detail** | Complete | Contact details, tabbed UI (opportunities, notes, files), activity timeline |
| **File Upload/Download** | Complete | S3 storage, upload to lead, download as blob |
| **Opportunities CRUD** | Complete | Create, read, update, soft-delete, search/filter, complete with recurrence |
| **Opportunity Detail** | Complete | Full detail page with stats, chase info, lead/service cards, timeline |
| **Services CRUD** | Complete | Categories, services, pricing, temperature defaults, recurrence |
| **Chase Sequences** | Complete | Per-service, per-temperature steps with delay config, AI personalization flag |
| **Templates** | Complete | CRUD, assign/unassign to steps, duplicate, EMAIL/SMS/WHATSAPP types |
| **AI Draft Generation** | Complete | Claude API integration, draft creation from chase scheduler |
| **AI Draft Review** | Complete | List/filter/edit/approve/reject drafts, send on approval |
| **Dashboard** | Complete | Stats cards (leads, opps, drafts, due today), due chases table, activity feed |
| **Email Sending** | Complete | AWS SES integration |
| **SMS Sending** | Complete | Twilio SMS integration |
| **WhatsApp Sending** | Complete | Twilio WhatsApp integration |
| **Chase Scheduler** | Complete | Daily 8am cron: finds due opps, processes sequence steps, sends or creates drafts |
| **Settings Page** | Complete | Account details, user management (invite/role), password change |
| **Swagger Docs** | Complete | OpenAPI 3 with JWT auth scheme |

---

## A) Tasks to Hit MVP

MVP = a usable product that a single small team could onboard, manage leads, run chase sequences, and review AI drafts.

### Critical Bugs & Data Integrity

| # | Task | Priority | Area |
|---|------|----------|------|
| 1 | **Add database indexes** on frequently queried columns: `lead.tenant_id`, `opportunity.tenant_id`, `opportunity.status`, `opportunity.next_chase_date`, `ai_draft.status`, `user_account.email` | P0 | Backend |
| 2 | **Add refresh token mechanism** — current JWT has no refresh; users are silently logged out after 24h with no recovery | P0 | Backend + Frontend |
| 3 | **Handle chase scheduler failures gracefully** — if SES/Twilio send fails mid-batch, remaining opportunities are skipped; add per-opportunity try/catch and error logging | P0 | Backend |
| 4 | **Add user management endpoints** — currently only the registration endpoint creates users; no way to add team members via API (Settings page UI exists but backend is missing `POST /users`, `PUT /users/{id}`, `DELETE /users/{id}`) | P0 | Backend |
| 5 | **Populate service dropdown in Opportunities filter** — currently hardcoded empty `<option>All Services</option>` with no dynamic options | P1 | Frontend |
| 6 | **Populate service dropdown in Drafts filter** — same issue, comment says "Services will be loaded dynamically when API is ready" | P1 | Frontend |
| 7 | **Add file download endpoint to backend** — `LeadDetailPage` has download logic but no `GET /leads/{id}/files/{fileId}/download` controller method found | P1 | Backend |
| 8 | **Add input sanitization/XSS protection** on template content and AI draft content before rendering as HTML | P1 | Backend + Frontend |
| 9 | **Replace `ddl-auto: update` with Flyway migrations** — auto DDL is dangerous in production (can drop columns, corrupt data) | P1 | Backend |

### Core UX Gaps

| # | Task | Priority | Area |
|---|------|----------|------|
| 10 | **Add "Log Activity" UI from Opportunity Detail page** — backend endpoint exists (`POST /opportunities/{id}/activities`) but no frontend button/modal to manually log an activity | P1 | Frontend |
| 11 | **Add loading/empty states for Settings > Users tab** — ensure invite flow works end-to-end | P1 | Frontend |
| 12 | **Add form validation on Opportunity creation** — currently no Zod schema; leadId is required but not validated client-side | P1 | Frontend |
| 13 | **Add toast feedback on draft approve/reject** — confirm action completed | P2 | Frontend |
| 14 | **Add confirmation before approving a draft** (sends real email/SMS) — currently one-click sends | P1 | Frontend |

### Testing & Stability

| # | Task | Priority | Area |
|---|------|----------|------|
| 15 | **Add integration tests for auth flow** (register → login → access protected endpoint) | P1 | Backend |
| 16 | **Add unit tests for ChaseSchedulerService** — this is the most critical business logic | P1 | Backend |
| 17 | **Add unit tests for TemplateTokenResolver** — template rendering must be reliable | P2 | Backend |

---

## B) Tasks for Full/Complete Project

Everything from MVP above, plus:

### User Management & Roles

| # | Task | Priority | Area |
|---|------|----------|------|
| 18 | **Full RBAC enforcement** — verify every endpoint respects role hierarchy (ADMIN > SALES_HANDLER > SALES_USER > EXPLORER); add `@PreAuthorize` annotations | P1 | Backend |
| 19 | **User profile avatars** — upload/display user profile pictures | P3 | Full Stack |
| 20 | **Password reset flow** — "Forgot password" with email link | P1 | Full Stack |
| 21 | **Email verification on registration** — send verification email, block access until verified | P2 | Full Stack |
| 22 | **Session management** — list active sessions, ability to revoke | P3 | Full Stack |

### Notifications & Real-Time

| # | Task | Priority | Area |
|---|------|----------|------|
| 23 | **Notification system** — backend notification model + API; TopBar bell icon already exists but is decorative | P1 | Full Stack |
| 24 | **WebSocket/SSE for real-time updates** — notify when new draft is ready, opportunity becomes due, etc. | P2 | Full Stack |
| 25 | **Email notifications for draft review** — alert handlers when AI generates a new draft needing review | P2 | Backend |

### Reporting & Analytics

| # | Task | Priority | Area |
|---|------|----------|------|
| 26 | **Lead conversion funnel** — leads → opportunities → completed pipeline visualization | P2 | Full Stack |
| 27 | **Chase performance metrics** — response rates by channel, temperature, service | P2 | Full Stack |
| 28 | **Export to CSV** — leads list, opportunities list, activity logs | P2 | Full Stack |
| 29 | **Date-range dashboard** — filter dashboard metrics by time period | P3 | Full Stack |

### Communication & Templates

| # | Task | Priority | Area |
|---|------|----------|------|
| 30 | **Rich HTML template editor** — CodeMirror dependencies are installed but not integrated; replace textarea with proper editor | P2 | Frontend |
| 31 | **Template preview with sample data** — render template with placeholder tokens replaced | P2 | Frontend |
| 32 | **Template versioning UI** — version field exists but no UI to view/restore previous versions | P3 | Full Stack |
| 33 | **Inbound message tracking** — track replies to emails/SMS/WhatsApp (webhook receivers) | P2 | Full Stack |
| 34 | **Email open/click tracking** — pixel tracking for sent emails | P3 | Backend |

### Lead Management Enhancements

| # | Task | Priority | Area |
|---|------|----------|------|
| 35 | **Lead import (CSV/Excel)** — bulk import leads | P2 | Full Stack |
| 36 | **Lead export** — download leads as CSV | P2 | Full Stack |
| 37 | **Lead merge/deduplication** — detect and merge duplicate leads | P3 | Full Stack |
| 38 | **Lead tags/custom fields** — flexible categorization beyond source/rating | P3 | Full Stack |
| 39 | **Lead assignment rules** — auto-assign leads to handlers based on source/rating | P3 | Backend |

### Opportunity Enhancements

| # | Task | Priority | Area |
|---|------|----------|------|
| 40 | **Kanban/pipeline board view** — drag-and-drop opportunity stages | P2 | Frontend |
| 41 | **Opportunity value/revenue tracking** — monetary value per opportunity for revenue forecasting | P2 | Full Stack |
| 42 | **Bulk opportunity actions** — bulk reassign, bulk complete, bulk delete | P3 | Full Stack |

### Mobile & Responsiveness

| # | Task | Priority | Area |
|---|------|----------|------|
| 43 | **Responsive sidebar** — hamburger menu toggle on mobile, slide-out drawer | P1 | Frontend |
| 44 | **Mobile-optimized tables** — card-based views on small screens instead of horizontal scroll | P2 | Frontend |
| 45 | **Mobile-optimized modals** — full-screen modals on mobile breakpoints | P2 | Frontend |

### DevOps & Deployment

| # | Task | Priority | Area |
|---|------|----------|------|
| 46 | **Dockerfile + docker-compose** — containerize backend + frontend + MySQL for local dev | P1 | DevOps |
| 47 | **CI/CD pipeline** — GitHub Actions for build, test, lint, deploy | P1 | DevOps |
| 48 | **Environment-specific configs** — application-dev.yml, application-prod.yml | P1 | Backend |
| 49 | **Production CORS configuration** — replace hardcoded localhost origins with env variable | P1 | Backend |
| 50 | **Rate limiting** — protect auth endpoints from brute force | P1 | Backend |
| 51 | **Health check endpoint** — `/actuator/health` for monitoring | P2 | Backend |
| 52 | **Structured JSON logging** — for log aggregation (ELK/CloudWatch) | P2 | Backend |
| 53 | **Database backup strategy** — automated MySQL backups | P2 | DevOps |

### Quality & Polish

| # | Task | Priority | Area |
|---|------|----------|------|
| 54 | **Comprehensive test suite** — service layer unit tests, controller integration tests, repository tests | P1 | Backend |
| 55 | **Frontend E2E tests** — Playwright/Cypress for critical flows (login, create lead, create opportunity) | P2 | Frontend |
| 56 | **API documentation enrichment** — add `@Operation`, `@ApiResponse` annotations to all endpoints | P2 | Backend |
| 57 | **Audit logging** — track who modified what and when | P2 | Backend |
| 58 | **Caching layer** — cache services/categories/templates (rarely change) with Redis or Spring Cache | P3 | Backend |
| 59 | **Full-text search** — MySQL full-text or Elasticsearch for lead/opportunity search | P3 | Backend |
| 60 | **Accessibility audit** — WCAG 2.1 AA compliance review and fixes | P2 | Frontend |

---

## C) Billing & Payments Microservice — `chaseflow-billing`

### Architecture Decision

A **separate Spring Boot microservice** (`chaseflow-billing`) handling all tenant account management, billing, payments, and entitlement enforcement. The main ChaseFlow CRM app communicates with it via REST API to check what a tenant is allowed to do.

### Why a Separate Service

- **Separation of concerns** — billing logic (Stripe webhooks, subscription lifecycle, invoice generation) does not belong in CRM business logic
- **Independent deployment** — billing changes (pricing, tiers, features) can ship without CRM downtime
- **Security isolation** — Stripe secrets, payment data, and PCI-related concerns are contained
- **Reusability** — if ChaseFlow expands to other products, the billing service serves all of them
- **Separate admin portal** — a dedicated super-admin frontend for managing tenants, viewing usage, handling support

### System Components

```
┌─────────────────────┐     REST API      ┌──────────────────────┐
│   ChaseFlow CRM     │ ◄──────────────► │  chaseflow-billing   │
│  (main app)         │   entitlements    │  (microservice)      │
│                     │   usage reporting │                      │
└─────────────────────┘                   └──────────┬───────────┘
                                                     │
┌─────────────────────┐                   ┌──────────▼───────────┐
│  Admin Portal       │ ◄──────────────► │    Stripe API        │
│  (separate React)   │   tenant mgmt    │    (webhooks)        │
└─────────────────────┘                   └──────────────────────┘
```

### Billing Service — Domain Model

**Tenant Subscription**
- `tenantId` (UUID — matches CRM tenant)
- `stripeCustomerId`
- `stripeSubscriptionId`
- `planTier` (FREE / STARTER / GROWTH / ENTERPRISE)
- `billingCycleStart`, `billingCycleEnd`
- `status` (ACTIVE / PAST_DUE / CANCELLED / TRIALING)

**Feature Entitlements** (per tenant, per billing cycle)
- `maxAgents` — FREE: 1, STARTER: 3, GROWTH: configurable (paid per additional agent)
- `emailEnabled` — true for all tiers (base allowance)
- `smsEnabled` — paid add-on feature (fixed cost, regardless of tier)
- `whatsappEnabled` — paid add-on feature (fixed cost, regardless of tier)
- `monthlyEmailQuota` — e.g., FREE: 100, STARTER: 1000, GROWTH: 5000
- `monthlySmsQuota` — 0 if not enabled, else allocated amount
- `monthlyWhatsappQuota` — 0 if not enabled, else allocated amount
- `monthlyAiDraftQuota` — e.g., FREE: 10, STARTER: 50, GROWTH: 200
- `monthlyAiTokenCredits` — total Claude API token budget per month

**Usage Tracking** (per tenant, per billing cycle)
- `emailsSent`
- `smsSent`
- `whatsappSent`
- `aiDraftsGenerated`
- `aiTokensConsumed`
- `activeAgentCount`

**Payment Methods**
- Managed via Stripe Customer Portal (no need to store card details)

**Invoices**
- Retrieved from Stripe API, displayed in admin portal

### Billing Service — API Endpoints

```
# Entitlement checks (called by CRM app)
GET  /api/v1/tenants/{tenantId}/entitlements     → full entitlement object
GET  /api/v1/tenants/{tenantId}/usage            → current cycle usage
POST /api/v1/tenants/{tenantId}/usage/increment   → { metric: "emails_sent", amount: 1 }

# Subscription management (called by admin portal or tenant settings)
GET  /api/v1/tenants/{tenantId}/subscription
POST /api/v1/tenants/{tenantId}/subscription/checkout  → Stripe checkout session URL
POST /api/v1/tenants/{tenantId}/subscription/portal    → Stripe customer portal URL
PUT  /api/v1/tenants/{tenantId}/subscription/plan      → upgrade/downgrade tier

# Feature add-ons
POST /api/v1/tenants/{tenantId}/addons/sms/enable
POST /api/v1/tenants/{tenantId}/addons/whatsapp/enable
POST /api/v1/tenants/{tenantId}/agents/add             → purchase additional agent seat

# Stripe webhooks
POST /api/v1/webhooks/stripe  → handles: checkout.session.completed,
                                         invoice.paid, invoice.payment_failed,
                                         customer.subscription.updated/deleted

# Tenant management (super-admin portal)
GET  /api/v1/admin/tenants                → list all tenants with subscription status
GET  /api/v1/admin/tenants/{id}           → tenant detail + usage + invoices
PUT  /api/v1/admin/tenants/{id}/override  → manual entitlement override (support)
```

### CRM Integration Points

The main ChaseFlow app needs to check entitlements at these enforcement points:

| CRM Action | Billing Check | On Failure |
|---|---|---|
| Invite/add user | `GET entitlements` → check `activeAgentCount < maxAgents` | Show "Upgrade plan or purchase additional seat" |
| Send email (scheduler/draft approve) | `POST usage/increment` → check `emailsSent < monthlyEmailQuota` | Queue for next cycle or show quota warning |
| Send SMS | Check `smsEnabled` + `smsSent < monthlySmsQuota` | Show "SMS not enabled — add from billing" |
| Send WhatsApp | Check `whatsappEnabled` + `whatsappSent < monthlyWhatsappQuota` | Show "WhatsApp not enabled — add from billing" |
| Generate AI draft | Check `aiDraftsGenerated < monthlyAiDraftQuota` + token budget | Show "AI quota reached" |
| Access service config | No check (available to all tiers) | — |

### CRM-Side Implementation

Add to main ChaseFlow backend:
1. **`BillingClient`** — REST client (Spring `RestClient` or `WebClient`) to call billing service
2. **`EntitlementService`** — wraps BillingClient, caches entitlements (5-min TTL), exposes `canSendEmail()`, `canAddAgent()`, `canUseAi()`, etc.
3. **`UsageReporter`** — increments usage counters after each send/draft
4. **Update `ChaseSchedulerService`** — check quotas before sending
5. **Update `AiDraftService`** — check AI quota before generating
6. **Update `UserAccountService`** — replace `enforceUserLimit()` with billing service call
7. **Add "Billing" tab to Settings page** — link to Stripe Customer Portal for self-service

### Pricing Model (Suggested Structure)

| | FREE | STARTER | GROWTH |
|---|---|---|---|
| **Price** | £0/mo | £29/mo | £79/mo |
| **Agents included** | 1 | 3 | 5 |
| **Additional agents** | — | £10/agent/mo | £10/agent/mo |
| **Email** | 100/mo | 1,000/mo | 5,000/mo |
| **SMS** | Not available | Add-on: £15/mo (500 SMS) | Add-on: £15/mo (500 SMS) |
| **WhatsApp** | Not available | Add-on: £20/mo (500 msgs) | Add-on: £20/mo (500 msgs) |
| **AI Drafts** | 10/mo | 50/mo | 200/mo |
| **AI Token Credits** | 50K/mo | 250K/mo | 1M/mo |

*Prices are placeholders — configure in Stripe Products/Prices*

### Admin Portal — Separate React App

A lightweight React app (same stack: Vite + Tailwind) for super-admin operations:

**Pages:**
- **Dashboard** — total tenants, MRR, churn rate, active subscriptions by tier
- **Tenants List** — searchable table with tier, status, usage, last active
- **Tenant Detail** — subscription info, usage charts, invoices, manual overrides
- **Revenue** — Stripe revenue charts, subscription growth

### Implementation Order (Billing Tasks)

| # | Task | Priority | Area |
|---|------|----------|------|
| 61 | **Bootstrap `chaseflow-billing` Spring Boot service** — project setup, MySQL DB, JWT auth (shared secret with CRM), Stripe SDK dependency | P1 | Billing Service |
| 62 | **Stripe integration** — Products, Prices, Checkout Sessions, Customer Portal, Webhook handler | P1 | Billing Service |
| 63 | **Entitlement & Usage models** — DB schema, CRUD, usage increment/reset on billing cycle | P1 | Billing Service |
| 64 | **Entitlement REST API** — endpoints for CRM to query tenant capabilities and report usage | P1 | Billing Service |
| 65 | **CRM: `BillingClient` + `EntitlementService`** — REST client with caching, enforcement methods | P1 | CRM Backend |
| 66 | **CRM: Enforce agent seat limits via billing service** — replace current `enforceUserLimit()` | P1 | CRM Backend |
| 67 | **CRM: Enforce message quotas** — check before sending email/SMS/WhatsApp in scheduler and draft approval | P1 | CRM Backend |
| 68 | **CRM: Enforce AI draft quotas** — check before calling Claude API | P1 | CRM Backend |
| 69 | **CRM: "Billing" tab in Settings** — show current plan, usage meters, link to Stripe Customer Portal | P1 | CRM Frontend |
| 70 | **CRM: Usage quota UI indicators** — show remaining quota in dashboard, warn when near limits | P2 | CRM Frontend |
| 71 | **CRM: Feature-gate UI elements** — hide/disable SMS/WhatsApp options if not enabled for tenant | P2 | CRM Frontend |
| 72 | **Admin Portal: Bootstrap React app** — auth, layout, tenant list, tenant detail | P2 | Admin Portal |
| 73 | **Admin Portal: Revenue dashboard** — Stripe reporting integration | P3 | Admin Portal |
| 74 | **Billing: Usage reset cron job** — reset monthly counters on billing cycle renewal | P1 | Billing Service |
| 75 | **Billing: Webhook handling for failed payments** — downgrade/restrict on payment failure | P1 | Billing Service |
| 76 | **Billing: Add-on management API** — enable/disable SMS, WhatsApp as individual paid features | P1 | Billing Service |
| 77 | **Billing: Per-agent pricing** — additional agent seat purchase and Stripe subscription item management | P2 | Billing Service |

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 4 | Blockers — must fix before any real usage |
| **P1** | 31 | MVP + billing essentials — needed for first real users |
| **P2** | 22 | Full product — expected features for a complete CRM |
| **P3** | 13 | Nice-to-have — polish, optimization, advanced features |

**MVP scope: Tasks 1–17** (core CRM bugs + UX + tests)
**Billing MVP: Tasks 61–69, 74–76** (billing service + CRM integration)
**Full project scope: All 77 tasks**
