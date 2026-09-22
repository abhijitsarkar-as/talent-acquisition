import type { SkillTagSource } from "../enums";

export interface CandidateSkillDto {
  id: string;
  skillNodeId: string;
  source: SkillTagSource;
  proficiency: string | null;
  skillNode: { id: string; name: string };
}

export interface CandidateDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  sourceChannel: string | null;
  createdAt: string;
  skills: CandidateSkillDto[];
}

export interface CreateCandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  sourceChannel?: string | null;
  skillNodeIds?: string[];
}

export interface BulkImportCandidatesRequest {
  candidates: CreateCandidateRequest[];
}

export interface BulkImportResult {
  created: number;
  skippedDuplicates: number;
}
