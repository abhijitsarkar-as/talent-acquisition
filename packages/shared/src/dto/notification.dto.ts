import type { NotificationType } from "../enums";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}
