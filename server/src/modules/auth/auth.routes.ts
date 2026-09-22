import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { loginSchema } from './auth.schema';
import { loginHandler, meHandler } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), asyncHandler(loginHandler));
authRouter.get('/me', requireAuth, asyncHandler(meHandler));
