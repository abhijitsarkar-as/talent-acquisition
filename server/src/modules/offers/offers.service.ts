import { ApprovalStepStatus, OfferStatus, UserRole } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { ApiError } from '../../utils/ApiError';

const offerInclude = { approvals: { orderBy: { sequence: 'asc' as const } } };

export async function listOffers(applicationId?: string) {
  return prisma.offer.findMany({ where: applicationId ? { applicationId } : undefined, include: offerInclude });
}

export async function getOffer(id: string) {
  const offer = await prisma.offer.findUnique({ where: { id }, include: offerInclude });
  if (!offer) throw ApiError.notFound('Offer not found');
  return offer;
}

export async function createOffer(input: {
  applicationId: string;
  templateId: string;
  compensation: { base: number; bonus?: number; equity?: number; currency: string };
  approverRoles: UserRole[];
}) {
  const [application, template] = await Promise.all([
    prisma.application.findUnique({ where: { id: input.applicationId } }),
    prisma.template.findUnique({ where: { id: input.templateId } }),
  ]);
  if (!application) throw ApiError.badRequest('applicationId does not reference a known application');
  if (!template) throw ApiError.badRequest('templateId does not reference a known template');
  if (!template.isApproved) throw ApiError.badRequest('Offer letter template must be approved before use');

  return prisma.offer.create({
    data: {
      applicationId: input.applicationId,
      templateId: input.templateId,
      compensation: input.compensation,
      status: OfferStatus.PENDING_APPROVAL,
      approvals: {
        create: input.approverRoles.map((approverRole, i) => ({ approverRole, sequence: i })),
      },
    },
    include: offerInclude,
  });
}

export async function decideApproval(
  offerId: string,
  approvalId: string,
  actor: { id: string; role: UserRole },
  input: { status: 'APPROVED' | 'REJECTED'; notes?: string },
) {
  const offer = await getOffer(offerId);
  const approval = offer.approvals.find((a) => a.id === approvalId);
  if (!approval) throw ApiError.notFound('Approval step not found on this offer');
  if (approval.status !== ApprovalStepStatus.PENDING) {
    throw ApiError.conflict('This approval step has already been decided');
  }
  if (approval.approverRole !== actor.role) {
    throw ApiError.forbidden(`This approval step requires ${approval.approverRole}`);
  }

  const priorPending = offer.approvals.find((a) => a.sequence < approval.sequence && a.status !== ApprovalStepStatus.APPROVED);
  if (priorPending) {
    throw ApiError.conflict('An earlier approval step in the chain has not been approved yet');
  }

  return prisma.$transaction(async (tx) => {
    await tx.offerApproval.update({
      where: { id: approvalId },
      data: {
        status: input.status === 'APPROVED' ? ApprovalStepStatus.APPROVED : ApprovalStepStatus.REJECTED,
        approverId: actor.id,
        decidedAt: new Date(),
        notes: input.notes,
      },
    });

    if (input.status === 'REJECTED') {
      return tx.offer.update({ where: { id: offerId }, data: { status: OfferStatus.DRAFT }, include: offerInclude });
    }

    const remaining = await tx.offerApproval.count({
      where: { offerId, status: ApprovalStepStatus.PENDING, id: { not: approvalId } },
    });

    if (remaining === 0) {
      return tx.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.EXTENDED, extendedAt: new Date() },
        include: offerInclude,
      });
    }

    return getOffer(offerId);
  });
}

export async function respondToOffer(id: string, status: 'ACCEPTED' | 'DECLINED') {
  const offer = await getOffer(id);
  if (offer.status !== OfferStatus.EXTENDED && offer.status !== OfferStatus.NEGOTIATING) {
    throw ApiError.conflict('Offer must be extended before it can be accepted or declined');
  }

  return prisma.offer.update({
    where: { id },
    data: {
      status: status === 'ACCEPTED' ? OfferStatus.ACCEPTED : OfferStatus.DECLINED,
      respondedAt: new Date(),
    },
    include: offerInclude,
  });
}

export async function negotiateOffer(id: string) {
  const offer = await getOffer(id);
  if (offer.status !== OfferStatus.EXTENDED) {
    throw ApiError.conflict('Only an extended offer can move to negotiating');
  }
  return prisma.offer.update({ where: { id }, data: { status: OfferStatus.NEGOTIATING }, include: offerInclude });
}
