import { z } from 'zod';
import { TemplateType } from '@prisma/client';

export const createTemplateSchema = z.object({
  type: z.nativeEnum(TemplateType),
  name: z.string().min(1),
  roleFamily: z.string().nullish(),
  region: z.string().nullish(),
  language: z.string().optional(),
  body: z.string().min(1),
  mergeFields: z.array(z.string()).optional(),
});

export const reviseTemplateSchema = z.object({
  body: z.string().min(1),
  mergeFields: z.array(z.string()).optional(),
});

export const listTemplatesQuerySchema = z.object({
  type: z.nativeEnum(TemplateType).optional(),
});
