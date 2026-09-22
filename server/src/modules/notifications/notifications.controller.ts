import { Request, Response } from 'express';
import * as notificationService from './notification.service';
import { checkSlaBreaches } from './sla.service';
import { ApiError } from '../../utils/ApiError';

export async function listNotificationsHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const notifications = await notificationService.listNotifications(req.user.id);
  res.json(notifications);
}

export async function markReadHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  await notificationService.markRead(req.params.id, req.user.id);
  res.status(204).end();
}

export async function triggerSlaCheckHandler(_req: Request, res: Response) {
  const result = await checkSlaBreaches();
  res.json(result);
}
