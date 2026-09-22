import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createInterviewSchema, submitScorecardSchema, setInterviewerSkillSchema } from './interviews.schema';
import { createScorecardTemplateSchema } from './scorecardTemplates.schema';
import {
  listInterviewsHandler,
  getInterviewHandler,
  listEligiblePanelistsHandler,
  setInterviewerSkillHandler,
  createInterviewHandler,
  submitScorecardHandler,
  listScorecardTemplatesHandler,
  createScorecardTemplateHandler,
} from './interviews.controller';

export const interviewsRouter = Router();

interviewsRouter.use(requireAuth);

interviewsRouter.get('/', asyncHandler(listInterviewsHandler));
interviewsRouter.get(
  '/scorecard-templates',
  asyncHandler(listScorecardTemplatesHandler),
);
interviewsRouter.post(
  '/scorecard-templates',
  requireRole(UserRole.ADMIN, UserRole.TA_LEAD),
  validateBody(createScorecardTemplateSchema),
  asyncHandler(createScorecardTemplateHandler),
);
interviewsRouter.get('/:id', asyncHandler(getInterviewHandler));
interviewsRouter.get('/eligible-panelists/:requisitionId', asyncHandler(listEligiblePanelistsHandler));
interviewsRouter.post('/', validateBody(createInterviewSchema), asyncHandler(createInterviewHandler));
interviewsRouter.put(
  '/interviewer-skills/:userId',
  requireRole(UserRole.ADMIN, UserRole.TA_LEAD),
  validateBody(setInterviewerSkillSchema),
  asyncHandler(setInterviewerSkillHandler),
);
interviewsRouter.post(
  '/panelists/:panelistId/scorecard',
  validateBody(submitScorecardSchema),
  asyncHandler(submitScorecardHandler),
);
