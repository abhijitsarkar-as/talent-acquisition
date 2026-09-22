import { Request, Response } from 'express';
import * as commentsService from './comments.service';
import { ApiError } from '../../utils/ApiError';

export async function listCommentsHandler(req: Request, res: Response) {
  const { candidateId, applicationId } = req.query as { candidateId?: string; applicationId?: string };
  const comments = await commentsService.listComments({ candidateId, applicationId });
  res.json(comments);
}

export async function createCommentHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const comment = await commentsService.createComment(req.user.id, req.body);
  res.status(201).json(comment);
}
