import { TemplateType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

export async function listTemplates(type?: TemplateType) {
  // Latest version per (type, name) — distinct picks the first row per group
  // given the orderBy, so ordering by version desc surfaces the newest one.
  return prisma.template.findMany({
    where: type ? { type } : undefined,
    orderBy: [{ name: 'asc' }, { version: 'desc' }],
    distinct: ['name'],
  });
}

export async function getTemplate(id: string) {
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) throw ApiError.notFound('Template not found');
  return template;
}

export async function createTemplate(
  ownerId: string,
  input: {
    type: TemplateType;
    name: string;
    roleFamily?: string | null;
    region?: string | null;
    language?: string;
    body: string;
    mergeFields?: string[];
  },
) {
  return prisma.template.create({
    data: {
      type: input.type,
      name: input.name,
      roleFamily: input.roleFamily ?? null,
      region: input.region ?? null,
      language: input.language ?? 'en',
      body: input.body,
      mergeFields: input.mergeFields ?? [],
      ownerId,
    },
  });
}

export async function approveTemplate(id: string, approverId: string) {
  const template = await getTemplate(id);
  if (template.isApproved) throw ApiError.conflict('Template is already approved');

  return prisma.template.update({
    where: { id },
    data: { isApproved: true, approvedById: approverId, approvedAt: new Date() },
  });
}

/** Editing an approved template creates a new versioned row rather than mutating it in place. */
export async function reviseTemplate(
  id: string,
  ownerId: string,
  input: { body: string; mergeFields?: string[] },
) {
  const previous = await getTemplate(id);

  return prisma.template.create({
    data: {
      type: previous.type,
      name: previous.name,
      roleFamily: previous.roleFamily,
      region: previous.region,
      language: previous.language,
      body: input.body,
      mergeFields: input.mergeFields ?? previous.mergeFields,
      version: previous.version + 1,
      supersedesId: previous.id,
      ownerId,
    },
  });
}
