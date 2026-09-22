import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { listWorkflowsHandler } from './workflow.controller';

export const workflowRouter = Router();

workflowRouter.use(requireAuth);
workflowRouter.get('/', asyncHandler(listWorkflowsHandler));
