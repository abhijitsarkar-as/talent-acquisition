import { Request, Response } from 'express';
import * as usersService from './users.service';

export async function listUsersHandler(_req: Request, res: Response) {
  const users = await usersService.listUsers();
  res.json(users);
}

export async function createUserHandler(req: Request, res: Response) {
  const user = await usersService.createUser(req.body);
  res.status(201).json(user);
}

export async function updateUserHandler(req: Request, res: Response) {
  const user = await usersService.updateUser(req.params.id, req.body);
  res.json(user);
}
