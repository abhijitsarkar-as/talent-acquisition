import { Prisma, PanelistStatus } from '@prisma/client';
import type { TransitionContext } from './workflow.engine';

export interface GuardResult {
  ok: boolean;
  reason?: string;
}

export type GuardFn = (tx: Prisma.TransactionClient, ctx: TransitionContext) => Promise<GuardResult>;

async function debriefQuorumMet(tx: Prisma.TransactionClient, ctx: TransitionContext): Promise<GuardResult> {
  if (!ctx.applicationId) {
    return { ok: false, reason: 'No application context for this transition' };
  }

  const panelists = await tx.interviewPanelist.findMany({
    where: { interview: { applicationId: ctx.applicationId } },
  });

  if (panelists.length === 0) {
    return { ok: false, reason: 'No interview panel has been scheduled for this application yet' };
  }

  const submitted = panelists.filter((p) => p.status === PanelistStatus.SCORECARD_SUBMITTED).length;
  if (submitted < panelists.length) {
    return { ok: false, reason: `Debrief quorum not met: ${submitted}/${panelists.length} scorecards submitted` };
  }

  return { ok: true };
}

/**
 * Which guard applies to which transition edge is configurable data
 * (WorkflowTransition.guardKey); the guard logic itself is code, since a
 * guard like "debrief quorum met" is a DB query, not something an admin
 * could meaningfully express as data.
 */
export const guardRegistry: Record<string, GuardFn> = {
  DEBRIEF_QUORUM_MET: debriefQuorumMet,
};
