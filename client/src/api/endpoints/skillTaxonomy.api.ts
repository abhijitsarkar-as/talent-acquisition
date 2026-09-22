import type { CreateSkillTaxonomyNodeRequest, SkillTaxonomyNodeDto } from '@ta/shared';
import { api } from '../client';

export function listSkillTaxonomy() {
  return api.get<SkillTaxonomyNodeDto[]>('/api/skill-taxonomy');
}

export function createSkillNode(input: CreateSkillTaxonomyNodeRequest) {
  return api.post<SkillTaxonomyNodeDto>('/api/skill-taxonomy', input);
}
