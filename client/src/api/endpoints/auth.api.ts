import type { CurrentUserDto, LoginResponse } from '@ta/shared';
import { api } from '../client';

export function login(email: string, password: string) {
  return api.post<LoginResponse>('/api/auth/login', { email, password });
}

export function me() {
  return api.get<CurrentUserDto>('/api/auth/me');
}
