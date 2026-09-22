import { z } from 'zod';
import { RequisitionPriority } from '@prisma/client';

export const createRequisitionSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  level: z.string().min(1),
  employmentType: z.string().min(1),
  locations: z.array(z.string()).min(1),
  headcount: z.number().int().positive().optional(),
  budgetMin: z.number().nonnegative().nullish(),
  budgetMax: z.number().nonnegative().nullish(),
  priority: z.nativeEnum(RequisitionPriority).optional(),
  targetOnboardDate: z.string().nullish(),
  jdTemplateId: z.string().nullish(),
  jdSnapshot: z.string().nullish(),
  recruiterOwnerId: z.string(),
  hiringManagerId: z.string(),
  requiredSkills: z
    .array(
      z.object({
        skillNodeId: z.string(),
        isRequired: z.boolean().optional(),
        minProficiency: z.string().nullish(),
      }),
    )
    .optional(),
});

export const transitionSchema = z.object({
  toStageKey: z.string().min(1),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
});
