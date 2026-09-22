import type { CommentDto, CreateCommentRequest } from '@ta/shared';
import { api } from '../client';

export function listComments(input: { candidateId?: string; applicationId?: string }) {
  return api.get<CommentDto[]>('/api/comments', input);
}

export function createComment(input: CreateCommentRequest) {
  return api.post<CommentDto>('/api/comments', input);
}
