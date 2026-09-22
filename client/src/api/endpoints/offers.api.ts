import type { CreateOfferRequest, DecideOfferApprovalRequest, OfferDto } from '@ta/shared';
import { api } from '../client';

export function listOffers(applicationId?: string) {
  return api.get<OfferDto[]>('/api/offers', applicationId ? { applicationId } : undefined);
}

export function createOffer(input: CreateOfferRequest) {
  return api.post<OfferDto>('/api/offers', input);
}

export function decideApproval(offerId: string, approvalId: string, input: DecideOfferApprovalRequest) {
  return api.post<OfferDto>(`/api/offers/${offerId}/approvals/${approvalId}/decide`, input);
}

export function respondToOffer(offerId: string, status: 'ACCEPTED' | 'DECLINED') {
  return api.post<OfferDto>(`/api/offers/${offerId}/respond`, { status });
}
