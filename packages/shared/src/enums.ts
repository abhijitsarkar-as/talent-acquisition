export const UserRole = {
  RECRUITER: "RECRUITER",
  HIRING_MANAGER: "HIRING_MANAGER",
  INTERVIEWER: "INTERVIEWER",
  TA_LEAD: "TA_LEAD",
  HRBP: "HRBP",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const WorkflowEntityType = {
  REQUISITION: "REQUISITION",
  APPLICATION: "APPLICATION",
} as const;
export type WorkflowEntityType = (typeof WorkflowEntityType)[keyof typeof WorkflowEntityType];

export const SkillNodeType = {
  CATEGORY: "CATEGORY",
  SKILL: "SKILL",
  PROFICIENCY_LEVEL: "PROFICIENCY_LEVEL",
} as const;
export type SkillNodeType = (typeof SkillNodeType)[keyof typeof SkillNodeType];

export const SkillTagSource = {
  SELF_REPORTED: "SELF_REPORTED",
  PARSED: "PARSED",
  INTERVIEWER_VALIDATED: "INTERVIEWER_VALIDATED",
} as const;
export type SkillTagSource = (typeof SkillTagSource)[keyof typeof SkillTagSource];

export const RequisitionPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type RequisitionPriority = (typeof RequisitionPriority)[keyof typeof RequisitionPriority];

export const PanelistStatus = {
  ASSIGNED: "ASSIGNED",
  SCORECARD_SUBMITTED: "SCORECARD_SUBMITTED",
  CANCELLED: "CANCELLED",
} as const;
export type PanelistStatus = (typeof PanelistStatus)[keyof typeof PanelistStatus];

export const ScorecardRecommendation = {
  STRONG_HIRE: "STRONG_HIRE",
  HIRE: "HIRE",
  NO_HIRE: "NO_HIRE",
  STRONG_NO_HIRE: "STRONG_NO_HIRE",
} as const;
export type ScorecardRecommendation = (typeof ScorecardRecommendation)[keyof typeof ScorecardRecommendation];

export const OfferStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  EXTENDED: "EXTENDED",
  NEGOTIATING: "NEGOTIATING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  RESCINDED: "RESCINDED",
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const ApprovalStepStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SKIPPED: "SKIPPED",
} as const;
export type ApprovalStepStatus = (typeof ApprovalStepStatus)[keyof typeof ApprovalStepStatus];

export const TemplateType = {
  JD: "JD",
  EMAIL: "EMAIL",
  OFFER_LETTER: "OFFER_LETTER",
} as const;
export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];

export const NotificationType = {
  STAGE_CHANGE: "STAGE_CHANGE",
  SLA_BREACH: "SLA_BREACH",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  MENTION: "MENTION",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

// Well-known stage keys seeded into the default workflows (see server/prisma/seed.ts).
// Custom workflows may define additional keys — these are the ones referenced by name
// in guard/action registries and must stay in sync with the seed data.
export const RequisitionStageKey = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  OPEN: "OPEN",
  ON_HOLD: "ON_HOLD",
  FILLED: "FILLED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;
export type RequisitionStageKey = (typeof RequisitionStageKey)[keyof typeof RequisitionStageKey];

export const ApplicationStageKey = {
  APPLIED: "APPLIED",
  SCREENING: "SCREENING",
  PHONE_INTERVIEW: "PHONE_INTERVIEW",
  ONSITE: "ONSITE",
  DEBRIEF: "DEBRIEF",
  OFFER: "OFFER",
  BACKGROUND_CHECK: "BACKGROUND_CHECK",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type ApplicationStageKey = (typeof ApplicationStageKey)[keyof typeof ApplicationStageKey];
