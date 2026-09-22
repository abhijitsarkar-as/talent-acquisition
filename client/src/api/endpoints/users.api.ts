import type { UserDto } from '@ta/shared';
import { api } from '../client';

export function listUsers() {
  return api.get<UserDto[]>('/api/users');
}
