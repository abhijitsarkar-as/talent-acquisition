import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createSavedReportSchema } from './reporting.schema';
import {
  timeInStageHandler,
  individualVelocityHandler,
  teamVelocityHandler,
  funnelHandler,
  agingHandler,
  interviewerTurnaroundHandler,
  pipelineSnapshotHandler,
  offerAcceptRateHandler,
  listSavedReportsHandler,
  createSavedReportHandler,
  exportPipelineSnapshotCsvHandler,
} from './reporting.controller';

export const reportingRouter = Router();

reportingRouter.use(requireAuth);

reportingRouter.get('/time-in-stage', asyncHandler(timeInStageHandler));
reportingRouter.get('/velocity/individual', asyncHandler(individualVelocityHandler));
reportingRouter.get('/velocity/team', asyncHandler(teamVelocityHandler));
reportingRouter.get('/funnel', asyncHandler(funnelHandler));
reportingRouter.get('/aging', asyncHandler(agingHandler));
reportingRouter.get('/interviewer-turnaround', asyncHandler(interviewerTurnaroundHandler));
reportingRouter.get('/pipeline-snapshot', asyncHandler(pipelineSnapshotHandler));
reportingRouter.get('/offer-accept-rate', asyncHandler(offerAcceptRateHandler));
reportingRouter.get('/pipeline-snapshot/export.csv', asyncHandler(exportPipelineSnapshotCsvHandler));
reportingRouter.get('/saved-reports', asyncHandler(listSavedReportsHandler));
reportingRouter.post('/saved-reports', validateBody(createSavedReportSchema), asyncHandler(createSavedReportHandler));
