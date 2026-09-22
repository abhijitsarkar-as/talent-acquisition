import type { UserRole } from "../enums";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId: string | null;
  isActive: boolean;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  managerId?: string | null;
}
