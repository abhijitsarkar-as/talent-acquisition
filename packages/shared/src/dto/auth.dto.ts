import type { UserRole } from "../enums";

export interface CurrentUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: CurrentUserDto;
}
