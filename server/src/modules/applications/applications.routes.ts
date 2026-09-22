import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  createApplicationSchema,
  transitionSchema,
  bulkTransitionSchema,
  listApplicationsQuerySchema,
} from './applications.schema';
import {
  listApplicationsHandler,
  getApplicationHandler,
  createApplicationHandler,
  transitionApplicationHandler,
  bulkTransitionApplicationsHandler,
} from './applications.controller';

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth);

applicationsRouter.get('/', validateQuery(listApplicationsQuerySchema), asyncHandler(listApplicationsHandler));
applicationsRouter.get('/:id', asyncHandler(getApplicationHandler));
applicationsRouter.post('/', validateBody(createApplicationSchema), asyncHandler(createApplicationHandler));
applicationsRouter.patch(
  '/:id/transition',
  validateBody(transitionSchema),
  asyncHandler(transitionApplicationHandler),
);
applicationsRouter.post(
  '/bulk-transition',
  validateBody(bulkTransitionSchema),
  asyncHandler(bulkTransitionApplicationsHandler),
);
