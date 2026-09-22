import { z } from 'zod';
import { ScorecardRecommendation } from '@prisma/client';

export const createInterviewSchema = z.object({
  applicationId: z.string(),
  stageLabel: z.string().min(1),
  scheduledStart: z.string(),
  scheduledEnd: z.string(),
  location: z.string().nullish(),
  interviewerIds: z.array(z.string()).min(1),
});

export const submitScorecardSchema = z.object({
  templateId: z.string(),
  recommendation: z.nativeEnum(ScorecardRecommendation),
  competencyRatings: z
    .array(
      z.object({
        skillNodeId: z.string(),
        rating: z.number().int().min(1).max(5),
        comments: z.string().optional(),
      }),
    )
    .min(1),
});

export const setInterviewerSkillSchema = z.object({
  skillNodeId: z.string(),
  competencyLevel: z.string().optional(),
});
