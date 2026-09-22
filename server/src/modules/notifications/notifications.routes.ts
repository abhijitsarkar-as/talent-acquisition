import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { listNotificationsHandler, markReadHandler, triggerSlaCheckHandler } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', asyncHandler(listNotificationsHandler));
notificationsRouter.patch('/:id/read', asyncHandler(markReadHandler));
notificationsRouter.post(
  '/sla-check',
  requireRole(UserRole.ADMIN, UserRole.TA_LEAD),
  asyncHandler(triggerSlaCheckHandler),
);
