import type { CreateTemplateRequest, TemplateDto, TemplateType } from '@ta/shared';
import { api } from '../client';

export function listTemplates(type?: TemplateType) {
  return api.get<TemplateDto[]>('/api/templates', type ? { type } : undefined);
}

export function createTemplate(input: CreateTemplateRequest) {
  return api.post<TemplateDto>('/api/templates', input);
}

export function approveTemplate(id: string) {
  return api.post<TemplateDto>(`/api/templates/${id}/approve`);
}
