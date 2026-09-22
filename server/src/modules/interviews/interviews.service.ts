import { PanelistStatus, ScorecardRecommendation } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

const interviewInclude = {
  panelists: {
    include: {
      interviewer: { select: { id: true, name: true } },
      scorecard: { include: { competencyRatings: { include: { skillNode: true } } } },
    },
  },
} as const;

export async function listInterviews(applicationId?: string) {
  return prisma.interview.findMany({
    where: applicationId ? { applicationId } : undefined,
    include: interviewInclude,
    orderBy: { scheduledStart: 'asc' },
  });
}

export async function getInterview(id: string) {
  const interview = await prisma.interview.findUnique({ where: { id }, include: interviewInclude });
  if (!interview) throw ApiError.notFound('Interview not found');
  return interview;
}

/** Interviewers whose InterviewerSkill overlaps the requisition's required skills. */
export async function listEligiblePanelists(requisitionId: string) {
  const requiredSkills = await prisma.requisitionSkill.findMany({ where: { requisitionId } });
  const skillNodeIds = requiredSkills.map((s) => s.skillNodeId);
  if (skillNodeIds.length === 0) return [];

  const matches = await prisma.interviewerSkill.findMany({
    where: { skillNodeId: { in: skillNodeIds } },
    include: { user: { select: { id: true, name: true, role: true } }, skillNode: true },
  });

  const byUser = new Map<string, { id: string; name: string; matchedSkills: string[] }>();
  for (const m of matches) {
    const entry = byUser.get(m.userId) ?? { id: m.user.id, name: m.user.name, matchedSkills: [] };
    entry.matchedSkills.push(m.skillNode.name);
    byUser.set(m.userId, entry);
  }
  return Array.from(byUser.values());
}

export async function setInterviewerSkill(
  userId: string,
  input: { skillNodeId: string; competencyLevel?: string },
) {
  return prisma.interviewerSkill.upsert({
    where: { userId_skillNodeId: { userId, skillNodeId: input.skillNodeId } },
    update: { competencyLevel: input.competencyLevel },
    create: { userId, skillNodeId: input.skillNodeId, competencyLevel: input.competencyLevel },
    include: { skillNode: true },
  });
}

export async function listScorecardTemplates() {
  return prisma.scorecardTemplate.findMany({ orderBy: { name: 'asc' } });
}

export async function createScorecardTemplate(input: {
  name: string;
  competencies: { skillNodeId: string; label: string; ratingScale?: string }[];
}) {
  return prisma.scorecardTemplate.create({
    data: { name: input.name, competencies: input.competencies, isApproved: true },
  });
}

export async function createInterview(input: {
  applicationId: string;
  stageLabel: string;
  scheduledStart: string;
  scheduledEnd: string;
  location?: string | null;
  interviewerIds: string[];
}) {
  const application = await prisma.application.findUnique({ where: { id: input.applicationId } });
  if (!application) throw ApiError.badRequest('applicationId does not reference a known application');

  return prisma.interview.create({
    data: {
      applicationId: input.applicationId,
      stageLabel: input.stageLabel,
      scheduledStart: new Date(input.scheduledStart),
      scheduledEnd: new Date(input.scheduledEnd),
      location: input.location ?? null,
      panelists: {
        create: input.interviewerIds.map((interviewerId) => ({ interviewerId })),
      },
    },
    include: interviewInclude,
  });
}

export async function submitScorecard(
  panelistId: string,
  submittedById: string,
  input: {
    templateId: string;
    recommendation: ScorecardRecommendation;
    competencyRatings: { skillNodeId: string; rating: number; comments?: string }[];
  },
) {
  const panelist = await prisma.interviewPanelist.findUnique({ where: { id: panelistId } });
  if (!panelist) throw ApiError.notFound('Panelist assignment not found');
  if (panelist.interviewerId !== submittedById) {
    throw ApiError.forbidden('Only the assigned interviewer can submit this scorecard');
  }
  if (panelist.status === PanelistStatus.SCORECARD_SUBMITTED) {
    throw ApiError.conflict('Scorecard already submitted for this panelist assignment');
  }

  return prisma.$transaction(async (tx) => {
    const scorecard = await tx.scorecard.create({
      data: {
        panelistId,
        templateId: input.templateId,
        submittedById,
        recommendation: input.recommendation,
        submittedAt: new Date(),
        competencyRatings: {
          create: input.competencyRatings.map((r) => ({
            skillNodeId: r.skillNodeId,
            rating: r.rating,
            comments: r.comments,
          })),
        },
      },
      include: { competencyRatings: { include: { skillNode: true } } },
    });

    await tx.interviewPanelist.update({
      where: { id: panelistId },
      data: { status: PanelistStatus.SCORECARD_SUBMITTED },
    });

    return scorecard;
  });
}
