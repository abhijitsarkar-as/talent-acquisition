import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { logger } from '../../utils/logger';
import { sendNotificationEmail } from './email.provider';

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
}

export async function markRead(id: string, userId: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  payload: Record<string, unknown>,
  email?: { subject: string; text: string },
) {
  await prisma.notification.create({ data: { userId, type, payload: payload as Prisma.InputJsonValue } });

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      try {
        await sendNotificationEmail(user.email, email.subject, email.text);
      } catch (err) {
        logger.error('[notify] Failed to send notification email', err);
      }
    }
  }
}
