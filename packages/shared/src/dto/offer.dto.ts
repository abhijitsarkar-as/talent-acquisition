import type { ApprovalStepStatus, OfferStatus, UserRole } from "../enums";

export interface OfferCompensation {
  base: number;
  bonus?: number;
  equity?: number;
  currency: string;
}

export interface OfferApprovalDto {
  id: string;
  approverRole: UserRole;
  approverId: string | null;
  status: ApprovalStepStatus;
  sequence: number;
  decidedAt: string | null;
  notes: string | null;
}

export interface OfferDto {
  id: string;
  applicationId: string;
  templateId: string;
  status: OfferStatus;
  compensation: OfferCompensation;
  extendedAt: string | null;
  respondedAt: string | null;
  approvals: OfferApprovalDto[];
}

export interface CreateOfferRequest {
  applicationId: string;
  templateId: string;
  compensation: OfferCompensation;
  approverRoles: UserRole[];
}

export interface DecideOfferApprovalRequest {
  status: "APPROVED" | "REJECTED";
  notes?: string;
}
