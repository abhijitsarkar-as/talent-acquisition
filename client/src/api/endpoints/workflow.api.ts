import type { WorkflowDefinitionDto, WorkflowEntityType } from '@ta/shared';
import { api } from '../client';

export function listWorkflows(entityType?: WorkflowEntityType) {
  return api.get<WorkflowDefinitionDto[]>('/api/workflows', entityType ? { entityType } : undefined);
}
