import { z } from 'zod';
import { UserRole } from '@prisma/client';

const compensationSchema = z.object({
  base: z.number().nonnegative(),
  bonus: z.number().nonnegative().optional(),
  equity: z.number().nonnegative().optional(),
  currency: z.string().min(1),
});

export const createOfferSchema = z.object({
  applicationId: z.string(),
  templateId: z.string(),
  compensation: compensationSchema,
  approverRoles: z.array(z.nativeEnum(UserRole)).min(1),
});

export const decideApprovalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});
