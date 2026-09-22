import { z } from 'zod';

export const createCommentSchema = z
  .object({
    candidateId: z.string().nullish(),
    applicationId: z.string().nullish(),
    body: z.string().min(1),
    mentionedUserIds: z.array(z.string()).optional(),
  })
  .refine((v) => v.candidateId || v.applicationId, {
    message: 'Either candidateId or applicationId is required',
  });

export const listCommentsQuerySchema = z.object({
  candidateId: z.string().optional(),
  applicationId: z.string().optional(),
});
