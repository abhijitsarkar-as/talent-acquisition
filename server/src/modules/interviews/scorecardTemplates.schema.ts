import { z } from 'zod';

export const createScorecardTemplateSchema = z.object({
  name: z.string().min(1),
  competencies: z
    .array(z.object({ skillNodeId: z.string(), label: z.string(), ratingScale: z.string().optional() }))
    .min(1),
});
