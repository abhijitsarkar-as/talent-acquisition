import { SkillNodeType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

const EXPECTED_PARENT_TYPE: Record<SkillNodeType, SkillNodeType | null> = {
  CATEGORY: null,
  SKILL: SkillNodeType.CATEGORY,
  PROFICIENCY_LEVEL: SkillNodeType.SKILL,
};

interface SkillNodeTree {
  id: string;
  type: SkillNodeType;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children: SkillNodeTree[];
}

export async function listSkillTaxonomyTree(): Promise<SkillNodeTree[]> {
  const nodes = await prisma.skillTaxonomyNode.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  const byId = new Map<string, SkillNodeTree>(nodes.map((n) => [n.id, { ...n, children: [] }]));
  const roots: SkillNodeTree[] = [];

  for (const node of byId.values()) {
    if (node.parentId) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createSkillNode(input: {
  type: SkillNodeType;
  name: string;
  parentId?: string | null;
  sortOrder?: number;
}) {
  const expectedParentType = EXPECTED_PARENT_TYPE[input.type];

  if (expectedParentType === null) {
    if (input.parentId) {
      throw ApiError.badRequest('A CATEGORY node cannot have a parent');
    }
  } else {
    if (!input.parentId) {
      throw ApiError.badRequest(`A ${input.type} node requires a parent of type ${expectedParentType}`);
    }
    const parent = await prisma.skillTaxonomyNode.findUnique({ where: { id: input.parentId } });
    if (!parent || parent.type !== expectedParentType) {
      throw ApiError.badRequest(`A ${input.type} node requires a parent of type ${expectedParentType}`);
    }
  }

  return prisma.skillTaxonomyNode.create({
    data: {
      type: input.type,
      name: input.name,
      parentId: input.parentId ?? null,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateSkillNode(
  id: string,
  input: { name?: string; sortOrder?: number; isActive?: boolean },
) {
  const node = await prisma.skillTaxonomyNode.findUnique({ where: { id } });
  if (!node) throw ApiError.notFound('Skill taxonomy node not found');

  return prisma.skillTaxonomyNode.update({ where: { id }, data: input });
}
