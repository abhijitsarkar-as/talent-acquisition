import { UserRole, WorkflowEntityType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';
import { transitionEntity } from '../workflow/workflow.service';

const applicationInclude = {
  candidate: { include: { skills: { include: { skillNode: true } } } },
  currentStage: true,
} as const;

export async function listApplications(requisitionId?: string) {
  return prisma.application.findMany({
    where: requisitionId ? { requisitionId } : undefined,
    include: applicationInclude,
    orderBy: { appliedAt: 'desc' },
  });
}

export async function getApplication(id: string) {
  const application = await prisma.application.findUnique({ where: { id }, include: applicationInclude });
  if (!application) throw ApiError.notFound('Application not found');
  return application;
}

async function getDefaultApplicationWorkflow() {
  const workflow = await prisma.workflowDefinition.findFirst({
    where: { entityType: WorkflowEntityType.APPLICATION, isDefault: true, isActive: true },
    include: { stages: true },
  });
  if (!workflow) throw ApiError.badRequest('No default application workflow is configured');
  const initialStage = workflow.stages.find((s) => s.isInitial);
  if (!initialStage) throw ApiError.badRequest('Default application workflow has no initial stage');
  return { workflow, initialStage };
}

export async function createApplication(input: { candidateId: string; requisitionId: string }) {
  const [candidate, requisition] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: input.candidateId } }),
    prisma.requisition.findUnique({ where: { id: input.requisitionId } }),
  ]);
  if (!candidate) throw ApiError.badRequest('candidateId does not reference a known candidate');
  if (!requisition) throw ApiError.badRequest('requisitionId does not reference a known requisition');

  const existing = await prisma.application.findUnique({
    where: { candidateId_requisitionId: { candidateId: input.candidateId, requisitionId: input.requisitionId } },
  });
  if (existing) throw ApiError.conflict('This candidate has already applied to this requisition');

  const { workflow, initialStage } = await getDefaultApplicationWorkflow();

  return prisma.application.create({
    data: {
      candidateId: input.candidateId,
      requisitionId: input.requisitionId,
      workflowId: workflow.id,
      currentStageId: initialStage.id,
      status: initialStage.key,
    },
    include: applicationInclude,
  });
}

export async function transitionApplication(
  id: string,
  actor: { id: string; role: UserRole },
  input: { toStageKey: string; reasonCode?: string; notes?: string },
) {
  const application = await getApplication(id);

  await transitionEntity({
    workflowId: application.workflowId,
    currentStageId: application.currentStageId,
    entityType: WorkflowEntityType.APPLICATION,
    entityId: application.id,
    requisitionId: application.requisitionId,
    applicationId: application.id,
    actorId: actor.id,
    actorRole: actor.role,
    toStageKey: input.toStageKey,
    reasonCode: input.reasonCode,
    notes: input.notes,
  });

  return getApplication(id);
}

export async function bulkTransitionApplications(
  applicationIds: string[],
  actor: { id: string; role: UserRole },
  input: { toStageKey: string; reasonCode?: string; notes?: string },
) {
  const succeeded: string[] = [];
  const failed: { applicationId: string; error: string }[] = [];

  for (const applicationId of applicationIds) {
    try {
      await transitionApplication(applicationId, actor, input);
      succeeded.push(applicationId);
    } catch (err) {
      failed.push({ applicationId, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return { succeeded, failed };
}
