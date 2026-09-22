# Talent Acquisition System — Requirements

## 1. Purpose & Scope

A system to manage the end-to-end hiring lifecycle — from job requisition to offer/onboarding handoff — with explicit workflow/state management, configurable templates (job descriptions, emails, scorecards, offers), and analytics that measure hiring **velocity** at both team and individual (recruiter/interviewer) level, broken down by **skill/role category**.

Deployment model: single-org internal tool (no multi-tenancy; no cross-org data isolation required).

Out of scope (v1): payroll, onboarding/HRIS provisioning, background-check vendor integration logic, candidate self-service portal, external ATS/HRIS/job-board integrations, performance management post-hire. These are deferred, not rejected — see NFR §4 for the extensibility hooks that keep them addable later without rework.

## 2. Personas

| Persona | Needs |
|---|---|
| Recruiter / TA Partner | Own requisitions, move candidates through pipeline, schedule interviews, track their own velocity |
| Hiring Manager | Approve requisitions, review candidates, give feedback, approve offers |
| Interviewer | Receive scorecards, submit structured feedback |
| TA Lead / Manager | Team-wide dashboards, workload balancing, velocity & funnel reporting |
| HRBP / Compensation | Offer approval, band compliance |
| Candidate (external) | No direct system access (recruiter/hiring-manager-facing tool only) — candidate-facing communication is via email templates |
| System Admin | Configure workflow states, templates, skill taxonomy, roles/permissions |

## 3. Functional Requirements

### 3.1 Job Requisition Management
- Create requisition from a **JD template**, with fields: title, department, level, employment type, location(s), headcount, budget/comp band, required skills (tagged from skill taxonomy), priority,Target onboarding Date.
- Requisition approval workflow (Draft → Pending Approval → Approved → Open → On Hold → Filled → Closed/Cancelled), configurable per org.
- Clone/duplicate a requisition or a past filled requisition as a starting point.
- Link requisition to one or more skill categories/competency profiles used later for velocity segmentation.

### 3.2 Job Description & Template Management
- Central template library, versioned, supporting:
  - **JD templates** (by role family/level, with variable placeholders: title, team, comp range, must-have skills, nice-to-have skills).
  - **Email templates** (application received, interview invite, rejection, offer, reference request), with merge fields and multi-language support.
  - **Interview scorecard templates** (per role/skill, structured competencies + rating scale).
  - **Offer letter templates** (per region/entity, legally reviewed, variable comp fields).
- Template ownership/approval (e.g., HR must approve legal language changes) and change history.
- Ability to export/copy an approved JD for manual posting to external job boards / careers page (no automated job-board integration in v1 — see NFR §4).

### 3.3 Candidate & Application Management
- Candidate profile: contact info, resume/CV parsing (skills extraction), source, application history across requisitions (dedupe by email/resume hash).
- Skills tagging on candidate profile (self-reported + parsed + interviewer-validated), mapped to the same skill taxonomy as requisitions — used for skill-based matching and reporting.
- Manual and bulk candidate import; sourcing channel tracking (referral, job board, agency, inbound).

### 3.4 Workflow & State Management
- Configurable **pipeline stages** per requisition/role family (e.g., Applied → Screening → Phone Interview → Onsite/Panel → Debrief → Offer → Background Check → Hired; plus Rejected/Withdrawn as terminal states from any stage).
- Formal **state machine**: explicit allowed transitions, guard conditions (e.g., cannot move to Offer without a completed Debrief with quorum of scorecards submitted), required approvals per transition, and automatic actions on transition (send template email, notify hiring manager, create calendar hold).
- Full state/audit history per candidate-requisition pairing: who moved it, from/to state, timestamp, reason/notes — required as the source data for velocity reporting.
- Support for parallel/branching workflow per interview panel (multiple interviewer sub-states rolling up to a stage-level "complete" state).
- SLA/aging rules per stage with escalation alerts when a candidate exceeds expected time-in-stage.
- Bulk stage actions (e.g., bulk reject a cohort) with reason codes.

### 3.5 Interview Management
- In-app scheduling (manual entry of date/time/panel; no external calendar sync in v1 — see NFR §4), panel assignment based on interviewer skill/competency mapping (so interviewers are matched to the skills they're rated to assess).
- Structured scorecards tied to the requisition's required skills; scores roll up into a stage decision.
- Debrief/consensus capture (recommend / no-hire / strong-hire with skill-level ratings).

### 3.6 Offer Management
- Offer creation from template, approval chain (hiring manager → HRBP → finance if above band), e-signature hook, offer status tracking (Extended → Negotiating → Accepted/Declined).

### 3.7 Reporting & Analytics (Core Differentiator)
- **Velocity metrics**, computed from state-transition history:
  - Time-in-stage and total time-to-fill, at requisition, team, and individual recruiter level.
  - **Individual velocity**: candidates moved per recruiter per period, average time-to-advance per stage, offers extended, offer-accept rate — segmented by skill/role category the recruiter is working (e.g., "Backend Engineering" vs "Sales").
  - **Team velocity**: aggregate throughput, rolling trend, comparison across skill categories to identify bottleneck skill areas (e.g., "Data Engineering reqs take 2.3x longer than average").
  - Funnel conversion rates per stage, per skill category, per source channel.
  - Interviewer load and turnaround time (time from scheduled to scorecard submitted) — identifies interview-stage bottlenecks caused by people, not process.
- Standard reports: pipeline snapshot, aging report, diversity funnel (if enabled), source effectiveness, offer-accept rate, cost/time-per-hire.
- Configurable/custom report builder (filter by date range, skill category, requisition, recruiter, department) with saved views and scheduled email/export delivery.
- Dashboards: role-based landing dashboards (recruiter's own queue + velocity vs. team lead's team-wide view).
- Export to CSV/Excel and API access to raw event/state data for BI tools.

### 3.8 Collaboration & Notifications
- @mentions/comments on candidate records, in-app + email notifications for stage changes, SLA breaches, pending approvals.

### 3.9 Skill Taxonomy Management
- Central, admin-managed skill/competency taxonomy (hierarchical: category → skill → proficiency level) shared across requisitions, candidates, interviewers, and scorecards, so velocity and funnel data can be sliced consistently by skill.

## 4. Non-Functional Requirements
- **RBAC**: role-based access (recruiter sees own reqs; TA lead sees team; hiring manager sees only their reqs; strict PII controls for candidate data).
- **Audit trail**: immutable log of all state transitions and record edits (compliance + reporting source of truth).
- **Data privacy/compliance**: GDPR/EEOC-style consent, right-to-erasure, data retention policy per region.
- **Integrations**: none in v1 (calendar, job boards, HRIS, SSO deferred) — see extensibility requirement below; interview scheduling and JD publishing are handled as in-app records/manual steps until an integration is added.
- **Performance**: dashboards must reflect state changes in **real time** (push/stream state-transition events to the dashboard layer, not just batch/nightly aggregation) while remaining fast as history volume grows — implies an append-only event/state-history table optimized for time-in-stage aggregation, separate from the current-state operational table, plus a live update channel (e.g., websocket/polling) to the UI.
- **Configurability**: workflow states, templates, and skill taxonomy must be admin-configurable without code changes.
- **Auditability of templates**: version history + who approved a template change.
- **Integration extensibility**: no external ATS/HRIS/job-board/calendar/SSO integrations in v1, but the domain model and APIs must be designed with clear extension points (e.g., outbound event hooks on state transitions, pluggable notification/publishing adapters) so integrations can be added later without re-architecting core workflow or data model.

## 5. Core Data Entities (indicative)
`Requisition`, `JobDescriptionTemplate`, `Candidate`, `Application` (candidate↔requisition), `PipelineStage`, `StateTransitionEvent` (audit/history — powers velocity reporting), `Interview`, `Scorecard`, `SkillTaxonomyNode`, `Offer`, `EmailTemplate`, `User/Role`.

## 6. Assumptions / Open Questions
1. Is this multi-tenant (multiple companies) or single-org internal tool? — affects data isolation design. Answer: single-org internal tool.
2. Does "velocity" reporting need real-time dashboards or is daily/batch aggregation acceptable? Answer: reporting need real-time dashboards.
3. Should candidates have a self-service portal, or is this recruiter/hiring-manager-facing only? Answer: recruiter/hiring-manager-facing only.
4. Which ATS/HRIS/job-board integrations are must-have for v1 vs. later? Answer: Ignore for the time being. Keep provision to do this integration in later stage.
5. Any existing skill taxonomy/competency framework to reuse, or build new? Answer: build new.
