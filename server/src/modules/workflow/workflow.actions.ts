import { NotificationType } from '@prisma/client';
import type { TransitionContext } from './workflow.engine';
import { prisma } from '../../prisma/client';
import { createNotification } from '../notifications/notification.service';

export type ActionFn = (ctx: TransitionContext) => Promise<void>;

async function notifyRecruiterOwner(ctx: TransitionContext) {
  if (!ctx.requisitionId) return;
  const requisition = await prisma.requisition.findUnique({ where: { id: ctx.requisitionId } });
  if (!requisition) return;

  await createNotification(
    requisition.recruiterOwnerId,
    NotificationType.STAGE_CHANGE,
    { entityType: ctx.entityType, entityId: ctx.entityId, toStageKey: ctx.toStageKey },
    {
      subject: `${requisition.title}: moved to ${ctx.toStageKey}`,
      text: `${requisition.title} moved to stage ${ctx.toStageKey}.`,
    },
  );
}

async function notifyHiringManager(ctx: TransitionContext) {
  if (!ctx.requisitionId) return;
  const requisition = await prisma.requisition.findUnique({ where: { id: ctx.requisitionId } });
  if (!requisition) return;

  await createNotification(
    requisition.hiringManagerId,
    NotificationType.STAGE_CHANGE,
    { entityType: ctx.entityType, entityId: ctx.entityId, toStageKey: ctx.toStageKey },
    {
      subject: `${requisition.title}: moved to ${ctx.toStageKey}`,
      text: `${requisition.title} moved to stage ${ctx.toStageKey}.`,
    },
  );
}

/**
 * Post-transition side effects (send templated email, create in-app
 * notification, ...). Run best-effort, after the transaction commits, so a
 * failed side effect never rolls back the state change. Which action keys
 * fire on which transition edge is configurable data
 * (WorkflowTransition.actionKeys); the action logic itself is code.
 */
export const actionRegistry: Record<string, ActionFn> = {
  'NOTIFY:recruiter_owner': notifyRecruiterOwner,
  'NOTIFY:hiring_manager': notifyHiringManager,
};
