import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createSkillNodeSchema, updateSkillNodeSchema } from './skillTaxonomy.schema';
import {
  listSkillTaxonomyHandler,
  createSkillNodeHandler,
  updateSkillNodeHandler,
} from './skillTaxonomy.controller';

export const skillTaxonomyRouter = Router();

skillTaxonomyRouter.use(requireAuth);

// Any authenticated user can read the taxonomy (requisition/candidate forms need it);
// only admins can edit it.
skillTaxonomyRouter.get('/', asyncHandler(listSkillTaxonomyHandler));
skillTaxonomyRouter.post(
  '/',
  requireRole(UserRole.ADMIN),
  validateBody(createSkillNodeSchema),
  asyncHandler(createSkillNodeHandler),
);
skillTaxonomyRouter.patch(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateBody(updateSkillNodeSchema),
  asyncHandler(updateSkillNodeHandler),
);
