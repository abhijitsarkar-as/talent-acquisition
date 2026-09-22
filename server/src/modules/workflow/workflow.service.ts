import { UserRole, WorkflowEntityType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { logger } from '../../utils/logger';
import { executeTransition, TransitionContext } from './workflow.engine';
import { actionRegistry } from './workflow.actions';
import { broadcast } from '../events/events.hub';

export async function transitionEntity(input: {
  workflowId: string;
  currentStageId: string | null;
  entityType: WorkflowEntityType;
  entityId: string;
  requisitionId: string | null;
  applicationId: string | null;
  actorId: string;
  actorRole: UserRole;
  toStageKey: string;
  reasonCode?: string;
  notes?: string;
}) {
  const ctx: TransitionContext = {
    entityType: input.entityType,
    entityId: input.entityId,
    requisitionId: input.requisitionId,
    applicationId: input.applicationId,
    actorId: input.actorId,
    actorRole: input.actorRole,
    toStageKey: input.toStageKey,
    reasonCode: input.reasonCode,
    notes: input.notes,
  };

  const outcome = await prisma.$transaction((tx) => executeTransition(tx, input.workflowId, input.currentStageId, ctx));

  // Best-effort, after commit — a failed action must never roll back the state change.
  for (const key of outcome.actionKeys) {
    const action = actionRegistry[key];
    if (!action) continue;
    action(ctx).catch((err) => logger.error(`workflow action "${key}" failed`, err));
  }

  broadcast({
    type: 'STATE_TRANSITION',
    entityType: input.entityType,
    entityId: input.entityId,
    requisitionId: input.requisitionId,
    applicationId: input.applicationId,
    toStageKey: outcome.toStageKey,
    occurredAt: new Date().toISOString(),
  });

  return outcome;
}
