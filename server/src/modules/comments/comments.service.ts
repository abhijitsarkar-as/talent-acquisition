import { NotificationType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { createNotification } from '../notifications/notification.service';

const commentInclude = { author: { select: { id: true, name: true } } } as const;

export async function listComments(input: { candidateId?: string; applicationId?: string }) {
  return prisma.comment.findMany({
    where: { candidateId: input.candidateId, applicationId: input.applicationId },
    include: commentInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function createComment(
  authorId: string,
  input: { candidateId?: string | null; applicationId?: string | null; body: string; mentionedUserIds?: string[] },
) {
  const comment = await prisma.comment.create({
    data: {
      candidateId: input.candidateId ?? null,
      applicationId: input.applicationId ?? null,
      authorId,
      body: input.body,
      mentionedUserIds: input.mentionedUserIds ?? [],
    },
    include: commentInclude,
  });

  for (const userId of input.mentionedUserIds ?? []) {
    if (userId === authorId) continue;
    await createNotification(userId, NotificationType.MENTION, {
      commentId: comment.id,
      candidateId: input.candidateId,
      applicationId: input.applicationId,
      authorName: comment.author.name,
      body: input.body,
    });
  }

  return comment;
}
