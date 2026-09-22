import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createCandidateSchema, bulkImportCandidatesSchema } from './candidates.schema';
import {
  listCandidatesHandler,
  getCandidateHandler,
  createCandidateHandler,
  bulkImportCandidatesHandler,
} from './candidates.controller';

export const candidatesRouter = Router();

candidatesRouter.use(requireAuth);

candidatesRouter.get('/', asyncHandler(listCandidatesHandler));
candidatesRouter.get('/:id', asyncHandler(getCandidateHandler));
candidatesRouter.post('/', validateBody(createCandidateSchema), asyncHandler(createCandidateHandler));
candidatesRouter.post(
  '/bulk-import',
  validateBody(bulkImportCandidatesSchema),
  asyncHandler(bulkImportCandidatesHandler),
);
