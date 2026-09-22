import type { WorkflowEntityType } from "./enums";

/** A stage within a WorkflowDefinition — mirrors the WorkflowStage Prisma model. */
export interface WorkflowStageDto {
  id: string;
  workflowId: string;
  key: string;
  label: string;
  isInitial: boolean;
  isTerminal: boolean;
  sortOrder: number;
  slaHours: number | null;
}

/** An allowed edge between two stages — mirrors the WorkflowTransition Prisma model. */
export interface WorkflowTransitionDto {
  id: string;
  workflowId: string;
  fromStageId: string | null;
  toStageId: string;
  name: string;
  guardKey: string | null;
  requiresApprovalRole: string | null;
  actionKeys: string[];
  allowedFromAnyStage: boolean;
  reasonCodeRequired: boolean;
}

export interface WorkflowDefinitionDto {
  id: string;
  name: string;
  description: string | null;
  entityType: WorkflowEntityType;
  isDefault: boolean;
  isActive: boolean;
  stages: WorkflowStageDto[];
  transitions: WorkflowTransitionDto[];
}

/** Request body for POST/PATCH transition endpoints — identical shape client and server. */
export interface TransitionRequest {
  toStageKey: string;
  reasonCode?: string;
  notes?: string;
}

/** Result returned when a guard blocks a transition, or on success. */
export interface TransitionResult {
  ok: boolean;
  reason?: string;
  eventId?: string;
}
