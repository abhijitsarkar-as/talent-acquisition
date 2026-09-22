import type { TemplateType } from "../enums";

export interface TemplateDto {
  id: string;
  type: TemplateType;
  name: string;
  roleFamily: string | null;
  region: string | null;
  language: string;
  body: string;
  mergeFields: string[];
  version: number;
  isApproved: boolean;
  approvedById: string | null;
  approvedAt: string | null;
  supersedesId: string | null;
  ownerId: string;
  createdAt: string;
}

export interface CreateTemplateRequest {
  type: TemplateType;
  name: string;
  roleFamily?: string | null;
  region?: string | null;
  language?: string;
  body: string;
  mergeFields?: string[];
}

/** Editing an approved template creates a new versioned row (supersedesId chain) rather than mutating it. */
export interface ReviseTemplateRequest {
  body: string;
  mergeFields?: string[];
}
