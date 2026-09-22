import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createCommentSchema, listCommentsQuerySchema } from './comments.schema';
import { listCommentsHandler, createCommentHandler } from './comments.controller';

export const commentsRouter = Router();

commentsRouter.use(requireAuth);

commentsRouter.get('/', validateQuery(listCommentsQuerySchema), asyncHandler(listCommentsHandler));
commentsRouter.post('/', validateBody(createCommentSchema), asyncHandler(createCommentHandler));
