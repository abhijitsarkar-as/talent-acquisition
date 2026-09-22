import type { WorkflowEntityType } from "./enums";

/**
 * Payload broadcast over SSE on every state transition. Deliberately thin —
 * clients use it as an invalidation signal and refetch the real aggregate
 * from the REST reporting endpoints rather than trusting this as the data.
 */
export interface StateTransitionSseEvent {
  type: "STATE_TRANSITION";
  entityType: WorkflowEntityType;
  entityId: string;
  requisitionId: string | null;
  applicationId: string | null;
  toStageKey: string;
  occurredAt: string;
}

export type SseEvent = StateTransitionSseEvent;
