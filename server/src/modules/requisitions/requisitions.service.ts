import { RequisitionPriority, UserRole, WorkflowEntityType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';
import { transitionEntity } from '../workflow/workflow.service';

const requisitionInclude = {
  currentStage: true,
  requiredSkills: { include: { skillNode: true } },
} as const;

export async function listRequisitions() {
  return prisma.requisition.findMany({ include: requisitionInclude, orderBy: { createdAt: 'desc' } });
}

export async function getRequisition(id: string) {
  const requisition = await prisma.requisition.findUnique({ where: { id }, include: requisitionInclude });
  if (!requisition) throw ApiError.notFound('Requisition not found');
  return requisition;
}

async function getDefaultRequisitionWorkflow() {
  const workflow = await prisma.workflowDefinition.findFirst({
    where: { entityType: WorkflowEntityType.REQUISITION, isDefault: true, isActive: true },
    include: { stages: true },
  });
  if (!workflow) throw ApiError.badRequest('No default requisition workflow is configured');
  const initialStage = workflow.stages.find((s) => s.isInitial);
  if (!initialStage) throw ApiError.badRequest('Default requisition workflow has no initial stage');
  return { workflow, initialStage };
}

export async function createRequisition(input: {
  title: string;
  department: string;
  level: string;
  employmentType: string;
  locations: string[];
  headcount?: number;
  budgetMin?: number | null;
  budgetMax?: number | null;
  priority?: RequisitionPriority;
  targetOnboardDate?: string | null;
  jdTemplateId?: string | null;
  jdSnapshot?: string | null;
  recruiterOwnerId: string;
  hiringManagerId: string;
  requiredSkills?: { skillNodeId: string; isRequired?: boolean; minProficiency?: string | null }[];
}) {
  const { workflow, initialStage } = await getDefaultRequisitionWorkflow();

  const [recruiter, hiringManager] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.recruiterOwnerId } }),
    prisma.user.findUnique({ where: { id: input.hiringManagerId } }),
  ]);
  if (!recruiter) throw ApiError.badRequest('recruiterOwnerId does not reference a known user');
  if (!hiringManager) throw ApiError.badRequest('hiringManagerId does not reference a known user');

  let jdSnapshot = input.jdSnapshot ?? null;
  if (input.jdTemplateId) {
    const template = await prisma.template.findUnique({ where: { id: input.jdTemplateId } });
    if (!template) throw ApiError.badRequest('jdTemplateId does not reference a known template');
    if (!template.isApproved) throw ApiError.badRequest('JD template must be approved before use');
    jdSnapshot = jdSnapshot ?? template.body;
  }

  return prisma.requisition.create({
    data: {
      title: input.title,
      department: input.department,
      level: input.level,
      employmentType: input.employmentType,
      locations: input.locations,
      headcount: input.headcount ?? 1,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      priority: input.priority ?? RequisitionPriority.MEDIUM,
      targetOnboardDate: input.targetOnboardDate ? new Date(input.targetOnboardDate) : null,
      workflowId: workflow.id,
      currentStageId: initialStage.id,
      jdTemplateId: input.jdTemplateId ?? null,
      jdSnapshot,
      recruiterOwnerId: input.recruiterOwnerId,
      hiringManagerId: input.hiringManagerId,
      requiredSkills: input.requiredSkills
        ? {
            create: input.requiredSkills.map((s) => ({
              skillNodeId: s.skillNodeId,
              isRequired: s.isRequired ?? true,
              minProficiency: s.minProficiency ?? null,
            })),
          }
        : undefined,
    },
    include: requisitionInclude,
  });
}

export async function cloneRequisition(id: string, actorId: string) {
  const source = await getRequisition(id);
  const { initialStage } = await getDefaultRequisitionWorkflow();

  return prisma.requisition.create({
    data: {
      title: `${source.title} (clone)`,
      department: source.department,
      level: source.level,
      employmentType: source.employmentType,
      locations: source.locations,
      headcount: source.headcount,
      budgetMin: source.budgetMin,
      budgetMax: source.budgetMax,
      priority: source.priority,
      targetOnboardDate: source.targetOnboardDate,
      workflowId: source.workflowId,
      currentStageId: initialStage.id,
      jdTemplateId: source.jdTemplateId,
      jdSnapshot: source.jdSnapshot,
      recruiterOwnerId: actorId,
      hiringManagerId: source.hiringManagerId,
      clonedFromId: source.id,
      requiredSkills: {
        create: source.requiredSkills.map((s) => ({
          skillNodeId: s.skillNodeId,
          isRequired: s.isRequired,
          minProficiency: s.minProficiency,
        })),
      },
    },
    include: requisitionInclude,
  });
}

export async function transitionRequisition(
  id: string,
  actor: { id: string; role: UserRole },
  input: { toStageKey: string; reasonCode?: string; notes?: string },
) {
  const requisition = await getRequisition(id);

  await transitionEntity({
    workflowId: requisition.workflowId,
    currentStageId: requisition.currentStageId,
    entityType: WorkflowEntityType.REQUISITION,
    entityId: requisition.id,
    requisitionId: requisition.id,
    applicationId: null,
    actorId: actor.id,
    actorRole: actor.role,
    toStageKey: input.toStageKey,
    reasonCode: input.reasonCode,
    notes: input.notes,
  });

  return getRequisition(id);
}
