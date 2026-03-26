# Database Restructuring: Service Channels & Simplified Opportunities

## Context

The current database couples chase sequences to both temperature and channel, making the model overly complex. Temperature-specific sequences (4 temps x 3 steps = 12 per service) create rigidity. Templates are assigned/unassigned to steps rather than directly linked. Opportunities carry many redundant fields.

The goal is to restructure around **Channel as a first-class entity** between Service and ChaseSequence, simplify Opportunity, and make templates directly reusable. Chase timing (delay days) moves out of sequences entirely into a tenant-level config, with an option for AI-determined chase dates.

---

## New Structure Diagram

```
                           CHASEFLOW DATA MODEL
  ====================================================================

  ┌───────────────────────────────┐
  │         TenantConfig          │   (NEW ENTITY - per tenant)
  │──────────────────────────────│
  │ id                            │
  │ tenant_id  (FK, unique)       │
  │ config  (JSON)                │   Single JSON column, structured as:
  │                               │
  │   {                           │
  │     "chase": {                │
  │       "hotDelayDays": 2,      │
  │       "mediumDelayDays": 7,   │
  │       "coldDelayDays": 14,    │
  │       "dormantDelayDays": 28, │
  │       "useAiChaseDate": false │
  │     },                        │
  │     "email": {                │
  │       "smtpHost": "...",      │
  │       "smtpPort": 587,        │
  │       "signature": "..."      │
  │     },                        │
  │     ...more config sections   │
  │   }                           │
  └───────────────────────────────┘


  ┌─────────────┐
  │   Service    │
  │─────────────│
  │ id           │
  │ tenantId     │
  │ serviceName  │
  │ serviceMode  │
  │ price        │
  │ recurrence   │
  │ ...          │
  └──────┬───────┘
         │ 1:M
         ▼
  ┌──────────────────┐
  │  ServiceChannel   │   (NEW ENTITY)
  │──────────────────│
  │ id                │
  │ service_id  (FK)  │
  │ channel (ENUM)    │──── EMAIL | SMS | WHATSAPP
  │ deleted           │
  │                   │   Unique: (service_id, channel)
  └──────┬────────────┘
         │ 1:M
         ▼
  ┌──────────────────────────┐          ┌──────────────────────┐
  │     ChaseSequence         │          │      Template         │
  │──────────────────────────│          │──────────────────────│
  │ id                        │          │ id                    │
  │ service_channel_id  (FK)  │          │ service_id  (FK)      │
  │ step_number               │   M:1    │ templateType (ENUM)   │
  │ is_final_step             │─────────>│ templateTitle         │
  │ stop_on_reply             │          │ subject               │
  │ use_ai_personalisation    │          │ templateContent       │
  │ ai_personalisation_guide  │          │ contentFormat         │
  │ template_id  (FK)         │          │ version               │
  │ deleted                   │          └───────────────────────┘
  │                           │           Templates are reusable:
  │ Unique: (svc_channel_id,  │           many sequences can share
  │          step_number)     │           the same template
  └───────────────────────────┘

  NO delay_days here!
  NO temperature here!
  Sequences define WHAT to send
  (step order + template) and
  WHETHER to use AI personalisation
  per step.


  ┌──────────────────────────────┐
  │         Opportunity           │   (SIMPLIFIED)
  │──────────────────────────────│
  │ id                            │
  │ tenant_id                     │
  │ lead_id  (FK)                 │
  │ service_id  (FK)              │
  │ channel  (ENUM)               │──── EMAIL | SMS | WHATSAPP
  │ temperature  (ENUM)           │──── HOT | MEDIUM | COLD | DORMANT
  │ current_step                  │
  │ next_chase_date               │
  │ ai_guidance_context  (TEXT)   │──── Personalised AI context for lead
  │ service_name                  │──── Denormalized for quick access
  │ stage                         │──── e.g. Prospecting, Negotiation
  │ stage_date                    │──── When stage last changed
  │ opportunity_type              │──── e.g. New Business, Upsell
  │ status                        │
  │ notes                         │
  │ date_added                    │
  │ date_completed                │
  │ deleted                       │
  └───────────────────────────────┘

  ====================================================================
  REMOVED FROM OPPORTUNITY:
    category, chaseTechnique, chaseMethod, sequenceSnapshot

  KEPT ON OPPORTUNITY (not originally in user's list but retained):
    serviceName, stageDate, stage, opportunityType

  REMOVED FROM CHASE_SEQUENCE:
    service_id (replaced by service_channel_id),
    temperature, channel (now on ServiceChannel),
    delay_days (now on TenantConfig per temperature)

  KEPT ON CHASE_SEQUENCE:
    use_ai_personalisation, ai_personalisation_guidance
    (per-step AI toggle + guidance, separate from
     opportunity-level ai_guidance_context for the lead)

  REMOVED FROM TEMPLATE:
    step_number (assignment now via ChaseSequence.template_id)
  ====================================================================
```

---

## Chase Timing Strategy

**Chase timing is decoupled from sequences.** Sequences define WHAT to send (step order + template). TenantConfig defines WHEN.

### TenantConfig.config JSON holds:
- `chase.hotDelayDays` / `mediumDelayDays` / `coldDelayDays` / `dormantDelayDays` — default gap between steps
- `chase.useAiChaseDate` — when true, AI determines the optimal next chase date based on:
  - Opportunity temperature
  - Lead activity history
  - Channel type
  - Any other criteria (extensible)

### How nextChaseDate is calculated:
1. If `use_ai_chase_date = true` → AI service determines the date
2. If `use_ai_chase_date = false` → use `TenantConfig.{temperature}_delay_days` to calculate `today + delay`
3. User can always manually override nextChaseDate

---

## Revert Earlier Changes

Before implementing, revert the `ChaseChannel` enum and related changes added to `ChaseSequence` earlier in this conversation:
- Remove `channel` field from `ChaseSequence.java`
- Remove `ChaseChannel` import from `ChaseSequence.java`
- Revert unique constraint back to original
- Remove `channel` from `ChaseSequenceRequest.java`, `ChaseSequenceResponse.java`
- Remove `channel` handling from `ChaseSequenceService.java`
- Revert `SequenceSnapshotEntry` in `OpportunityService.java`
- Delete `ChaseChannel.java` enum (will be recreated as part of new structure or reuse `TemplateType`)

---

## Implementation Plan

### Phase 1: Revert + New Entities

1. **Revert earlier ChaseChannel changes** (see above)

2. **Create `TenantConfig` entity**
   - `domain/TenantConfig.java` — (id, tenant_id unique, config JSON). Use `@Column(columnDefinition = "JSON")` with a Java POJO/Map deserialized via JPA converter or Jackson
   - `repository/TenantConfigRepository.java` — `findByTenantId(UUID)`
   - Auto-create default TenantConfig with sensible defaults when a tenant is created
   - JSON structure is extensible — add new config sections without schema changes

3. **Create `ServiceChannel` entity**
   - `domain/ServiceChannel.java` — (id, service_id, channel, deleted)
   - `repository/ServiceChannelRepository.java`
   - Add `@OneToMany List<ServiceChannel> channels` to `Service.java`

### Phase 2: Modify Existing Entities

1. **`ChaseSequence.java`**
   - Replace `service` FK → `serviceChannel` FK
   - Remove: `temperature`, `channel`, `delayDays`
   - Keep: `useAiPersonalisation`, `aiPersonalisationGuidance` (per-step AI control)
   - Add: `template` FK (nullable ManyToOne to Template)
   - Update unique constraint: `(service_channel_id, step_number)`

2. **`Template.java`**
   - Remove: `stepNumber` (assignment is now via ChaseSequence.template_id)

3. **`Opportunity.java`**
   - Add: `channel` (ChaseChannel enum), `aiGuidanceContext` (TEXT)
   - Keep: `stage`, `stageDate`, `opportunityType`, `serviceName`
   - Remove: `category`, `chaseTechnique`, `chaseMethod`, `sequenceSnapshot`

### Phase 3: Service Layer Updates

1. **`ChaseDefaults.java`** — rewrite: seed 3 steps per ServiceChannel (no temperature dimension). Remove delay logic.

2. **`ServiceManagementService.java`** — on service creation, create ServiceChannel rows (default: EMAIL) + seed sequences per channel.

3. **`ChaseSequenceService.java`** — CRUD by serviceChannelId. Template linking = setting template_id.

4. **`TemplateService.java`** — simplify to pure CRUD (remove assign/unassign).

5. **`OpportunityService.java`** — simplified creation with channel. NextChaseDate from TenantConfig (or AI). Remove snapshot logic.

6. **`AiDraftService.java`** — use BOTH `aiGuidanceContext` from Opportunity (lead-level context) AND `aiPersonalisationGuidance` from ChaseSequence (step-level guidance) when generating drafts.

7. **New: `TenantConfigService.java`** — CRUD for tenant config. Method: `getNextChaseDate(tenantId, temperature)`.

### Phase 4: DTO & Controller Updates

- DTOs: update Opportunity, ChaseSequence, Template request/response
- New: `TenantConfigController` at `/api/v1/settings/chase-config`
- New: ServiceChannel endpoints (or embed in service CRUD)
- Update sequence routes to work under channels

### Phase 5: Frontend Updates

- SequencesTab: channel tabs (EMAIL/SMS/WHATSAPP), each showing steps with template picker
- TemplatesTab: reusable template library
- Opportunity forms: add channel selector, remove old fields, add AI guidance textarea
- Settings page: chase config section (delay days per temperature, AI toggle)

### Phase 6: Cleanup

- Remove deprecated DB columns via manual SQL
- Remove old code paths
- Update unique constraints

---

## Key Files

**New files:**
- `domain/TenantConfig.java`
- `domain/ServiceChannel.java`
- `repository/TenantConfigRepository.java`
- `repository/ServiceChannelRepository.java`
- `service/TenantConfigService.java`

**Major modifications:**
- `domain/ChaseSequence.java` — FK restructure, field removal
- `domain/Template.java` — remove stepNumber
- `domain/Opportunity.java` — add channel + aiGuidanceContext, remove 4 fields
- `domain/Service.java` — add channels relationship
- `service/OpportunityService.java` — simplified, config-based timing
- `service/ChaseSequenceService.java` — channel-based CRUD
- `service/TemplateService.java` — simplified
- `service/ChaseDefaults.java` — complete rewrite
- `service/ServiceManagementService.java` — channel-aware creation
- `service/AiDraftService.java` — guidance from opportunity

**DTOs:**
- `dto/request/OpportunityRequest.java`
- `dto/response/OpportunityResponse.java`
- `dto/request/ChaseSequenceRequest.java`
- `dto/response/ChaseSequenceResponse.java`

**Frontend:**
- `pages/services/modals/tabs/SequencesTab.jsx`
- `pages/services/modals/tabs/TemplatesTab.jsx`
- `pages/opportunities/` (all files)
- `pages/settings/SettingsPage.jsx` (chase config section)

---

## Verification

1. Create a tenant → verify default TenantConfig is created with default delay days
2. Create a service → verify ServiceChannels auto-created + sequences seeded
3. Add/edit chase sequence steps per channel → verify template linking works
4. Create opportunity with channel → verify nextChaseDate uses TenantConfig delay
5. Toggle `use_ai_chase_date` → verify AI date calculation kicks in
6. Complete opportunity with recurrence → verify new opportunity inherits channel
7. Frontend: verify channel tabs in sequences, template picker, opportunity forms
