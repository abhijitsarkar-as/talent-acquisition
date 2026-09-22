import { z } from 'zod';

export const createSavedReportSchema = z.object({
  name: z.string().min(1),
  filters: z.record(z.unknown()),
  schedule: z.record(z.unknown()).optional(),
});
