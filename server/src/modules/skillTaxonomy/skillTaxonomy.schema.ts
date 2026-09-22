import { z } from 'zod';
import { SkillNodeType } from '@prisma/client';

export const createSkillNodeSchema = z.object({
  type: z.nativeEnum(SkillNodeType),
  name: z.string().min(1),
  parentId: z.string().nullish(),
  sortOrder: z.number().int().optional(),
});

export const updateSkillNodeSchema = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
