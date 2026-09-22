import { z } from 'zod';

export const createApplicationSchema = z.object({
  candidateId: z.string(),
  requisitionId: z.string(),
});

export const transitionSchema = z.object({
  toStageKey: z.string().min(1),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
});

export const bulkTransitionSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  toStageKey: z.string().min(1),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
});

export const listApplicationsQuerySchema = z.object({
  requisitionId: z.string().optional(),
});
