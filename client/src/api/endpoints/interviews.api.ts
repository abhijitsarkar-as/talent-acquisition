import type { CreateInterviewRequest, InterviewDto, ScorecardDto, SubmitScorecardRequest } from '@ta/shared';
import { api } from '../client';

export interface EligiblePanelist {
  id: string;
  name: string;
  matchedSkills: string[];
}

export interface ScorecardTemplateDto {
  id: string;
  name: string;
  competencies: { skillNodeId: string; label: string; ratingScale?: string }[];
}

export function listInterviews(applicationId?: string) {
  return api.get<InterviewDto[]>('/api/interviews', applicationId ? { applicationId } : undefined);
}

export function listEligiblePanelists(requisitionId: string) {
  return api.get<EligiblePanelist[]>(`/api/interviews/eligible-panelists/${requisitionId}`);
}

export function createInterview(input: CreateInterviewRequest) {
  return api.post<InterviewDto>('/api/interviews', input);
}

export function listScorecardTemplates() {
  return api.get<ScorecardTemplateDto[]>('/api/interviews/scorecard-templates');
}

export function submitScorecard(panelistId: string, input: SubmitScorecardRequest) {
  return api.post<ScorecardDto>(`/api/interviews/panelists/${panelistId}/scorecard`, input);
}
