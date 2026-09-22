import { Prisma, UserRole, WorkflowEntityType } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { guardRegistry } from './workflow.guards';

export interface TransitionContext {
  entityType: WorkflowEntityType;
  entityId: string;
  requisitionId: string | null;
  applicationId: string | null;
  actorId: string;
  actorRole: UserRole;
  toStageKey: string;
  reasonCode?: string;
  notes?: string;
}

export interface TransitionOutcome {
  eventId: string;
  toStageId: string;
  toStageKey: string;
  actionKeys: string[];
}

type Tx = Prisma.TransactionClient;

/**
 * The single entry point every transactional state change in the system
 * routes through (requisition approval, candidate pipeline moves, offer
 * status — as those entity types come online). Loads the matching
 * WorkflowTransition row for (workflowId, fromStage -> toStage), enforces
 * its guard/approval/reason-code requirements, applies the state change on
 * the owning entity, and writes the StateTransitionEvent audit row — all in
 * the same DB transaction, so operational state and audit history can never
 * diverge. Post-transition actions (email, notifications, ...) are
 * deliberately NOT run here — the caller runs them after the transaction
 * commits, best-effort.
 */
export async function executeTransition(
  tx: Tx,
  workflowId: string,
  currentStageId: string | null,
  ctx: TransitionContext,
): Promise<TransitionOutcome> {
  const toStage = await tx.workflowStage.findUnique({
    where: { workflowId_key: { workflowId, key: ctx.toStageKey } },
  });
  if (!toStage) {
    throw ApiError.badRequest(`Unknown stage "${ctx.toStageKey}" for this workflow`);
  }

  const transition = await tx.workflowTransition.findFirst({
    where: {
      workflowId,
      toStageId: toStage.id,
      OR: [{ fromStageId: currentStageId }, { allowedFromAnyStage: true }],
    },
  });
  if (!transition) {
    throw ApiError.conflict(`No transition to "${ctx.toStageKey}" is allowed from the current stage`);
  }

  if (transition.requiresApprovalRole && transition.requiresApprovalRole !== ctx.actorRole) {
    throw ApiError.forbidden(`This transition requires ${transition.requiresApprovalRole} approval`);
  }

  if (transition.guardKey) {
    const guard = guardRegistry[transition.guardKey];
    if (!guard) {
      throw ApiError.badRequest(`Unknown guard "${transition.guardKey}" configured on this transition`);
    }
    const result = await guard(tx, ctx);
    if (!result.ok) {
      throw ApiError.unprocessable(result.reason ?? 'Transition blocked');
    }
  }

  if (transition.reasonCodeRequired && !ctx.reasonCode) {
    throw ApiError.badRequest('This transition requires a reason code');
  }

  switch (ctx.entityType) {
    case WorkflowEntityType.REQUISITION:
      await tx.requisition.update({
        where: { id: ctx.entityId },
        data: { currentStageId: toStage.id },
      });
      break;
    case WorkflowEntityType.APPLICATION:
      await tx.application.update({
        where: { id: ctx.entityId },
        data: { currentStageId: toStage.id, status: toStage.key, isActive: !toStage.isTerminal },
      });
      break;
  }

  const event = await tx.stateTransitionEvent.create({
    data: {
      entityType: ctx.entityType,
      entityId: ctx.entityId,
      requisitionId: ctx.requisitionId,
      applicationId: ctx.applicationId,
      fromStageId: currentStageId,
      toStageId: toStage.id,
      transitionId: transition.id,
      actorId: ctx.actorId,
      actorRole: ctx.actorRole,
      reasonCode: ctx.reasonCode,
      notes: ctx.notes,
    },
  });

  return { eventId: event.id, toStageId: toStage.id, toStageKey: toStage.key, actionKeys: transition.actionKeys };
}
