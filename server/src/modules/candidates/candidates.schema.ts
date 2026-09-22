import { z } from 'zod';

export const createCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullish(),
  resumeUrl: z.string().nullish(),
  sourceChannel: z.string().nullish(),
  skillNodeIds: z.array(z.string()).optional(),
});

export const bulkImportCandidatesSchema = z.object({
  candidates: z.array(createCandidateSchema).min(1),
});
