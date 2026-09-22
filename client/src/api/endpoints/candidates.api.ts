import type { CandidateDto, CreateCandidateRequest } from '@ta/shared';
import { api } from '../client';

export function listCandidates() {
  return api.get<CandidateDto[]>('/api/candidates');
}

export function createCandidate(input: CreateCandidateRequest) {
  return api.post<CandidateDto>('/api/candidates', input);
}
