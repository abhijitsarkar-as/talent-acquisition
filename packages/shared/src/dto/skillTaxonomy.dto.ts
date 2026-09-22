import type { SkillNodeType } from "../enums";

export interface SkillTaxonomyNodeDto {
  id: string;
  type: SkillNodeType;
  name: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: SkillTaxonomyNodeDto[];
}

export interface CreateSkillTaxonomyNodeRequest {
  type: SkillNodeType;
  name: string;
  parentId?: string | null;
  sortOrder?: number;
}

export interface UpdateSkillTaxonomyNodeRequest {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}
