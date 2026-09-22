import type { CreateRequisitionRequest, RequisitionDto } from '@ta/shared';
import { api } from '../client';

export function listRequisitions() {
  return api.get<RequisitionDto[]>('/api/requisitions');
}

export function getRequisition(id: string) {
  return api.get<RequisitionDto>(`/api/requisitions/${id}`);
}

export function createRequisition(input: CreateRequisitionRequest) {
  return api.post<RequisitionDto>('/api/requisitions', input);
}

export function cloneRequisition(id: string) {
  return api.post<RequisitionDto>(`/api/requisitions/${id}/clone`);
}

export function transitionRequisition(id: string, toStageKey: string, reasonCode?: string) {
  return api.patch<RequisitionDto>(`/api/requisitions/${id}/transition`, { toStageKey, reasonCode });
}
