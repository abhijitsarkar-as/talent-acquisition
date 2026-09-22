import type { CandidateDto } from "./candidate.dto";

export interface ApplicationDto {
  id: string;
  candidateId: string;
  candidate: CandidateDto;
  requisitionId: string;
  workflowId: string;
  currentStageId: string;
  currentStage: { id: string; key: string; label: string };
  status: string;
  isActive: boolean;
  appliedAt: string;
}

export interface CreateApplicationRequest {
  candidateId: string;
  requisitionId: string;
}

export interface BulkTransitionRequest {
  applicationIds: string[];
  toStageKey: string;
  reasonCode?: string;
  notes?: string;
}

export interface BulkTransitionResult {
  succeeded: string[];
  failed: { applicationId: string; error: string }[];
}
