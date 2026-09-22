import type { NotificationDto } from '@ta/shared';
import { api } from '../client';

export function listNotifications() {
  return api.get<NotificationDto[]>('/api/notifications');
}

export function markRead(id: string) {
  return api.patch<void>(`/api/notifications/${id}/read`);
}
