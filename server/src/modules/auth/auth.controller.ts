import { Request, Response } from 'express';
import * as authService from './auth.service';
import { ApiError } from '../../utils/ApiError';

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
}

export async function meHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.getCurrentUser(req.user.id);
  res.json(user);
}
