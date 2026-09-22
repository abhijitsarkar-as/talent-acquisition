import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createUserSchema, updateUserSchema } from './users.schema';
import { listUsersHandler, createUserHandler, updateUserHandler } from './users.controller';

export const usersRouter = Router();

usersRouter.use(requireAuth);

// Any authenticated user can list users (needed to pick hiring managers/recruiters/panelists
// in later milestones); only admins can create/edit accounts.
usersRouter.get('/', asyncHandler(listUsersHandler));
usersRouter.post('/', requireRole(UserRole.ADMIN), validateBody(createUserSchema), asyncHandler(createUserHandler));
usersRouter.patch(
  '/:id',
  requireRole(UserRole.ADMIN),
  validateBody(updateUserSchema),
  asyncHandler(updateUserHandler),
);
