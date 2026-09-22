export interface CommentDto {
  id: string;
  candidateId: string | null;
  applicationId: string | null;
  authorId: string;
  author: { id: string; name: string };
  body: string;
  mentionedUserIds: string[];
  createdAt: string;
}

export interface CreateCommentRequest {
  candidateId?: string | null;
  applicationId?: string | null;
  body: string;
  mentionedUserIds?: string[];
}
