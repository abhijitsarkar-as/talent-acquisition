import type { RequisitionPriority } from "../enums";

export interface RequisitionSkillDto {
  id: string;
  skillNodeId: string;
  isRequired: boolean;
  minProficiency: string | null;
  skillNode: { id: string; name: string; type: string };
}

/** Mirrors the server's Prisma `include` shape directly (nested relations), not a hand-mapped projection. */
export interface RequisitionDto {
  id: string;
  title: string;
  department: string;
  level: string;
  employmentType: string;
  locations: string[];
  headcount: number;
  budgetMin: string | null;
  budgetMax: string | null;
  priority: RequisitionPriority;
  targetOnboardDate: string | null;
  currentStageId: string | null;
  currentStage: { id: string; key: string; label: string } | null;
  workflowId: string;
  jdTemplateId: string | null;
  jdSnapshot: string | null;
  recruiterOwnerId: string;
  hiringManagerId: string;
  clonedFromId: string | null;
  createdAt: string;
  requiredSkills: RequisitionSkillDto[];
}

export interface CreateRequisitionRequest {
  title: string;
  department: string;
  level: string;
  employmentType: string;
  locations: string[];
  headcount?: number;
  budgetMin?: number | null;
  budgetMax?: number | null;
  priority?: RequisitionPriority;
  targetOnboardDate?: string | null;
  jdTemplateId?: string | null;
  jdSnapshot?: string | null;
  recruiterOwnerId: string;
  hiringManagerId: string;
  requiredSkills?: { skillNodeId: string; isRequired?: boolean; minProficiency?: string | null }[];
}
