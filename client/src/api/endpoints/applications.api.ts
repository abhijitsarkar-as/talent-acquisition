import type { ApplicationDto, BulkTransitionResult, CreateApplicationRequest } from '@ta/shared';
import { api } from '../client';

export function listApplications(requisitionId?: string) {
  return api.get<ApplicationDto[]>('/api/applications', requisitionId ? { requisitionId } : undefined);
}

export function getApplication(id: string) {
  return api.get<ApplicationDto>(`/api/applications/${id}`);
}

export function createApplication(input: CreateApplicationRequest) {
  return api.post<ApplicationDto>('/api/applications', input);
}

export function transitionApplication(id: string, toStageKey: string, reasonCode?: string) {
  return api.patch<ApplicationDto>(`/api/applications/${id}/transition`, { toStageKey, reasonCode });
}

export function bulkTransitionApplications(applicationIds: string[], toStageKey: string, reasonCode?: string) {
  return api.post<BulkTransitionResult>('/api/applications/bulk-transition', {
    applicationIds,
    toStageKey,
    reasonCode,
  });
}
