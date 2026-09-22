import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createOfferSchema, decideApprovalSchema } from './offers.schema';
import {
  listOffersHandler,
  getOfferHandler,
  createOfferHandler,
  decideApprovalHandler,
  respondToOfferHandler,
  negotiateOfferHandler,
} from './offers.controller';

const respondSchema = z.object({ status: z.enum(['ACCEPTED', 'DECLINED']) });

export const offersRouter = Router();

offersRouter.use(requireAuth);

offersRouter.get('/', asyncHandler(listOffersHandler));
offersRouter.get('/:id', asyncHandler(getOfferHandler));
offersRouter.post('/', validateBody(createOfferSchema), asyncHandler(createOfferHandler));
offersRouter.post(
  '/:id/approvals/:approvalId/decide',
  validateBody(decideApprovalSchema),
  asyncHandler(decideApprovalHandler),
);
offersRouter.post('/:id/respond', validateBody(respondSchema), asyncHandler(respondToOfferHandler));
offersRouter.post('/:id/negotiate', asyncHandler(negotiateOfferHandler));
