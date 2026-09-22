import type { PanelistStatus, ScorecardRecommendation } from "../enums";

export interface ScorecardCompetencyDto {
  skillNodeId: string;
  rating: number;
  comments: string | null;
  skillNode: { id: string; name: string };
}

export interface ScorecardDto {
  id: string;
  panelistId: string;
  templateId: string;
  recommendation: ScorecardRecommendation;
  submittedAt: string | null;
  competencyRatings: ScorecardCompetencyDto[];
}

export interface InterviewPanelistDto {
  id: string;
  interviewerId: string;
  interviewer: { id: string; name: string };
  status: PanelistStatus;
  scorecard: ScorecardDto | null;
}

export interface InterviewDto {
  id: string;
  applicationId: string;
  stageLabel: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string | null;
  panelists: InterviewPanelistDto[];
}

export interface CreateInterviewRequest {
  applicationId: string;
  stageLabel: string;
  scheduledStart: string;
  scheduledEnd: string;
  location?: string | null;
  interviewerIds: string[];
}

export interface SubmitScorecardRequest {
  templateId: string;
  recommendation: ScorecardRecommendation;
  competencyRatings: { skillNodeId: string; rating: number; comments?: string }[];
}

export interface InterviewerSkillDto {
  id: string;
  userId: string;
  skillNodeId: string;
  competencyLevel: string | null;
  skillNode: { id: string; name: string };
}

export interface SetInterviewerSkillRequest {
  skillNodeId: string;
  competencyLevel?: string;
}
