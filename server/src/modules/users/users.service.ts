import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  managerId: true,
  isActive: true,
} as const;

export async function listUsers() {
  return prisma.user.findMany({ select: userSelect, orderBy: { name: 'asc' } });
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  managerId?: string | null;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      managerId: input.managerId ?? null,
    },
    select: userSelect,
  });
}

export async function updateUser(
  id: string,
  input: { name?: string; role?: UserRole; managerId?: string | null; isActive?: boolean },
) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');

  return prisma.user.update({
    where: { id },
    data: input,
    select: userSelect,
  });
}
