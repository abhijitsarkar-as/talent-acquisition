import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';

/**
 * Time-in-stage per application, derived via LEAD() over the append-only
 * StateTransitionEvent history — no stored duration column, so it's always
 * correct from raw events and never needs backfilling when stages change.
 */
export async function getTimeInStageReport(requisitionId?: string) {
  return prisma.$queryRaw<
    {
      entityId: string;
      requisitionId: string | null;
      toStageKey: string;
      toStageLabel: string;
      occurredAt: Date;
      minutesInStage: number | null;
    }[]
  >(Prisma.sql`
    WITH events AS (
      SELECT
        e."entityId",
        e."requisitionId",
        e."occurredAt",
        s.key AS "toStageKey",
        s.label AS "toStageLabel",
        LEAD(e."occurredAt") OVER (PARTITION BY e."entityId" ORDER BY e."occurredAt") AS "nextOccurredAt"
      FROM state_transition_events e
      JOIN workflow_stages s ON s.id = e."toStageId"
      WHERE e."entityType" = 'APPLICATION'
      ${requisitionId ? Prisma.sql`AND e."requisitionId" = ${requisitionId}` : Prisma.empty}
    )
    SELECT
      "entityId",
      "requisitionId",
      "toStageKey",
      "toStageLabel",
      "occurredAt",
      EXTRACT(EPOCH FROM (COALESCE("nextOccurredAt", now()) - "occurredAt")) / 60 AS "minutesInStage"
    FROM events
    ORDER BY "occurredAt" ASC
  `);
}

/**
 * Individual velocity segmented by skill category — one row per
 * (recruiter, category) combination the recruiter's requisitions touch.
 * A requisition tagged with multiple skill categories contributes its
 * transitions to each; an intentional simplification, not a bug.
 */
export async function getIndividualVelocityReport(from?: Date, to?: Date) {
  return prisma.$queryRaw<
    { actorId: string; actorName: string; category: string | null; transitions: number }[]
  >(Prisma.sql`
    SELECT
      e."actorId",
      u.name AS "actorName",
      cat.name AS "category",
      COUNT(*)::int AS "transitions"
    FROM state_transition_events e
    JOIN users u ON u.id = e."actorId"
    LEFT JOIN requisitions r ON r.id = e."requisitionId"
    LEFT JOIN requisition_skills rs ON rs."requisitionId" = r.id
    LEFT JOIN skill_taxonomy_nodes skill ON skill.id = rs."skillNodeId"
    LEFT JOIN skill_taxonomy_nodes cat ON cat.id = skill."parentId"
    WHERE e."entityType" = 'APPLICATION'
      ${from ? Prisma.sql`AND e."occurredAt" >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND e."occurredAt" <= ${to}` : Prisma.empty}
    GROUP BY e."actorId", u.name, cat.name
    ORDER BY "transitions" DESC
  `);
}

/** Team aggregate throughput by week, segmented by skill category, to surface bottleneck categories. */
export async function getTeamVelocityReport() {
  return prisma.$queryRaw<{ category: string | null; weekBucket: Date; transitions: number }[]>(Prisma.sql`
    SELECT
      cat.name AS "category",
      date_trunc('week', e."occurredAt") AS "weekBucket",
      COUNT(*)::int AS "transitions"
    FROM state_transition_events e
    LEFT JOIN requisitions r ON r.id = e."requisitionId"
    LEFT JOIN requisition_skills rs ON rs."requisitionId" = r.id
    LEFT JOIN skill_taxonomy_nodes skill ON skill.id = rs."skillNodeId"
    LEFT JOIN skill_taxonomy_nodes cat ON cat.id = skill."parentId"
    WHERE e."entityType" = 'APPLICATION'
    GROUP BY cat.name, date_trunc('week', e."occurredAt")
    ORDER BY "weekBucket" ASC
  `);
}

/** Stage funnel — distinct applications that ever reached each stage. */
export async function getFunnelReport(requisitionId?: string) {
  return prisma.$queryRaw<
    { stageKey: string; stageLabel: string; sortOrder: number; applicationCount: number }[]
  >(Prisma.sql`
    SELECT
      s.key AS "stageKey",
      s.label AS "stageLabel",
      s."sortOrder",
      COUNT(DISTINCT e."entityId")::int AS "applicationCount"
    FROM state_transition_events e
    JOIN workflow_stages s ON s.id = e."toStageId"
    WHERE e."entityType" = 'APPLICATION'
      ${requisitionId ? Prisma.sql`AND e."requisitionId" = ${requisitionId}` : Prisma.empty}
    GROUP BY s.key, s.label, s."sortOrder"
    ORDER BY s."sortOrder" ASC
  `);
}

/** Applications aging past their current stage's configured SLA. */
export async function getAgingReport() {
  return prisma.$queryRaw<
    {
      applicationId: string;
      candidateName: string;
      stageKey: string;
      stageLabel: string;
      hoursInStage: number;
      slaHours: number | null;
      breached: boolean;
    }[]
  >(Prisma.sql`
    WITH latest_event AS (
      SELECT DISTINCT ON (e."entityId")
        e."entityId" AS "applicationId",
        e."occurredAt" AS "enteredStageAt"
      FROM state_transition_events e
      WHERE e."entityType" = 'APPLICATION'
      ORDER BY e."entityId", e."occurredAt" DESC
    )
    SELECT
      a.id AS "applicationId",
      c."firstName" || ' ' || c."lastName" AS "candidateName",
      s.key AS "stageKey",
      s.label AS "stageLabel",
      EXTRACT(EPOCH FROM (now() - le."enteredStageAt")) / 3600 AS "hoursInStage",
      s."slaHours",
      (s."slaHours" IS NOT NULL AND EXTRACT(EPOCH FROM (now() - le."enteredStageAt")) / 3600 > s."slaHours") AS "breached"
    FROM applications a
    JOIN latest_event le ON le."applicationId" = a.id
    JOIN workflow_stages s ON s.id = a."currentStageId"
    JOIN candidates c ON c.id = a."candidateId"
    WHERE a."isActive" = true
    ORDER BY "hoursInStage" DESC
  `);
}

/** Interviewer load/turnaround — time from scheduled interview to scorecard submitted. */
export async function getInterviewerTurnaroundReport() {
  return prisma.$queryRaw<
    {
      interviewerId: string;
      interviewerName: string;
      interviewId: string;
      scheduledStart: Date;
      submittedAt: Date | null;
      turnaroundHours: number | null;
    }[]
  >(Prisma.sql`
    SELECT
      ip."interviewerId",
      u.name AS "interviewerName",
      i.id AS "interviewId",
      i."scheduledStart",
      sc."submittedAt",
      CASE WHEN sc."submittedAt" IS NOT NULL
        THEN EXTRACT(EPOCH FROM (sc."submittedAt" - i."scheduledStart")) / 3600
        ELSE NULL
      END AS "turnaroundHours"
    FROM interview_panelists ip
    JOIN interviews i ON i.id = ip."interviewId"
    JOIN users u ON u.id = ip."interviewerId"
    LEFT JOIN scorecards sc ON sc."panelistId" = ip.id
    ORDER BY i."scheduledStart" DESC
  `);
}

export async function getPipelineSnapshot() {
  const rows = await prisma.application.groupBy({
    by: ['currentStageId'],
    where: { isActive: true },
    _count: { _all: true },
  });
  const stages = await prisma.workflowStage.findMany({ where: { id: { in: rows.map((r) => r.currentStageId) } } });

  return rows.map((r) => {
    const stage = stages.find((s) => s.id === r.currentStageId);
    return { stageId: r.currentStageId, stageKey: stage?.key, stageLabel: stage?.label, count: r._count._all };
  });
}

export async function listSavedReports(ownerId: string) {
  return prisma.savedReport.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } });
}

export async function createSavedReport(ownerId: string, input: { name: string; filters: unknown; schedule?: unknown }) {
  return prisma.savedReport.create({
    data: { ownerId, name: input.name, filters: input.filters as Prisma.InputJsonValue, schedule: input.schedule as Prisma.InputJsonValue },
  });
}

export async function getOfferAcceptRate() {
  const [accepted, declined] = await Promise.all([
    prisma.offer.count({ where: { status: 'ACCEPTED' } }),
    prisma.offer.count({ where: { status: 'DECLINED' } }),
  ]);
  const total = accepted + declined;
  return { accepted, declined, total, acceptRate: total > 0 ? accepted / total : null };
}
