import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createTemplateSchema, reviseTemplateSchema, listTemplatesQuerySchema } from './templates.schema';
import {
  listTemplatesHandler,
  getTemplateHandler,
  createTemplateHandler,
  approveTemplateHandler,
  reviseTemplateHandler,
} from './templates.controller';

export const templatesRouter = Router();

templatesRouter.use(requireAuth);

const canAuthor = requireRole(UserRole.RECRUITER, UserRole.TA_LEAD, UserRole.HRBP, UserRole.ADMIN);
const canApprove = requireRole(UserRole.TA_LEAD, UserRole.HRBP, UserRole.ADMIN);

templatesRouter.get('/', validateQuery(listTemplatesQuerySchema), asyncHandler(listTemplatesHandler));
templatesRouter.get('/:id', asyncHandler(getTemplateHandler));
templatesRouter.post('/', canAuthor, validateBody(createTemplateSchema), asyncHandler(createTemplateHandler));
templatesRouter.post('/:id/approve', canApprove, asyncHandler(approveTemplateHandler));
templatesRouter.post(
  '/:id/revise',
  canAuthor,
  validateBody(reviseTemplateSchema),
  asyncHandler(reviseTemplateHandler),
);
