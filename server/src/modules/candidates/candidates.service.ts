import { SkillTagSource } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

const candidateInclude = {
  skills: { include: { skillNode: true } },
} as const;

export async function listCandidates() {
  return prisma.candidate.findMany({ include: candidateInclude, orderBy: { createdAt: 'desc' } });
}

export async function getCandidate(id: string) {
  const candidate = await prisma.candidate.findUnique({ where: { id }, include: candidateInclude });
  if (!candidate) throw ApiError.notFound('Candidate not found');
  return candidate;
}

interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  sourceChannel?: string | null;
  resumeHash?: string | null;
  skillNodeIds?: string[];
}

export async function findDuplicateCandidate(email: string, resumeHash?: string | null) {
  return prisma.candidate.findFirst({
    where: { OR: [{ email }, ...(resumeHash ? [{ resumeHash }] : [])] },
  });
}

export async function createCandidate(input: CreateCandidateInput) {
  const duplicate = await findDuplicateCandidate(input.email, input.resumeHash);
  if (duplicate) {
    throw ApiError.conflict('A candidate with this email or resume already exists');
  }

  return prisma.candidate.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      resumeUrl: input.resumeUrl ?? null,
      resumeHash: input.resumeHash ?? null,
      sourceChannel: input.sourceChannel ?? null,
      skills: input.skillNodeIds
        ? {
            create: input.skillNodeIds.map((skillNodeId) => ({
              skillNodeId,
              source: SkillTagSource.SELF_REPORTED,
            })),
          }
        : undefined,
    },
    include: candidateInclude,
  });
}

export async function bulkImportCandidates(candidates: CreateCandidateInput[]) {
  let created = 0;
  let skippedDuplicates = 0;

  for (const input of candidates) {
    const duplicate = await findDuplicateCandidate(input.email, input.resumeHash);
    if (duplicate) {
      skippedDuplicates += 1;
      continue;
    }
    await prisma.candidate.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        resumeUrl: input.resumeUrl ?? null,
        resumeHash: input.resumeHash ?? null,
        sourceChannel: input.sourceChannel ?? null,
      },
    });
    created += 1;
  }

  return { created, skippedDuplicates };
}
