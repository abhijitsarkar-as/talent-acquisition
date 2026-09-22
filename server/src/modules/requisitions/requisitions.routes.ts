import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createRequisitionSchema, transitionSchema } from './requisitions.schema';
import {
  listRequisitionsHandler,
  getRequisitionHandler,
  createRequisitionHandler,
  cloneRequisitionHandler,
  transitionRequisitionHandler,
} from './requisitions.controller';

export const requisitionsRouter = Router();

requisitionsRouter.use(requireAuth);

const canManage = requireRole(UserRole.RECRUITER, UserRole.TA_LEAD, UserRole.ADMIN);

requisitionsRouter.get('/', asyncHandler(listRequisitionsHandler));
requisitionsRouter.get('/:id', asyncHandler(getRequisitionHandler));
requisitionsRouter.post('/', canManage, validateBody(createRequisitionSchema), asyncHandler(createRequisitionHandler));
requisitionsRouter.post('/:id/clone', canManage, asyncHandler(cloneRequisitionHandler));
requisitionsRouter.patch(
  '/:id/transition',
  validateBody(transitionSchema),
  asyncHandler(transitionRequisitionHandler),
);
