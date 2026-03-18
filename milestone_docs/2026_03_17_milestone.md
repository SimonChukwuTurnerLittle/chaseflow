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

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 4 | Blockers — must fix before any real usage |
| **P1** | 19 | MVP essentials — needed for first real users |
| **P2** | 18 | Full product — expected features for a complete CRM |
| **P3** | 12 | Nice-to-have — polish, optimization, advanced features |

**MVP scope: Tasks 1–17** (4 P0 + 10 P1 + 3 P2 testing tasks)
**Full project scope: All 60 tasks**
