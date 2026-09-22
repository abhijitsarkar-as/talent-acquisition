import { Request, Response } from 'express';
import { WorkflowEntityType } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

export async function listWorkflowsHandler(req: Request, res: Response) {
  const entityType = req.query.entityType as WorkflowEntityType | undefined;
  if (entityType && !Object.values(WorkflowEntityType).includes(entityType)) {
    throw ApiError.badRequest('Invalid entityType');
  }

  const workflows = await prisma.workflowDefinition.findMany({
    where: entityType ? { entityType } : undefined,
    include: {
      stages: { orderBy: { sortOrder: 'asc' } },
      transitions: true,
    },
  });
  res.json(workflows);
}
