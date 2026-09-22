import { Request, Response } from 'express';
import * as interviewsService from './interviews.service';
import { ApiError } from '../../utils/ApiError';

export async function listInterviewsHandler(req: Request, res: Response) {
  const applicationId = req.query.applicationId as string | undefined;
  const interviews = await interviewsService.listInterviews(applicationId);
  res.json(interviews);
}

export async function getInterviewHandler(req: Request, res: Response) {
  const interview = await interviewsService.getInterview(req.params.id);
  res.json(interview);
}

export async function listEligiblePanelistsHandler(req: Request, res: Response) {
  const panelists = await interviewsService.listEligiblePanelists(req.params.requisitionId);
  res.json(panelists);
}

export async function setInterviewerSkillHandler(req: Request, res: Response) {
  const skill = await interviewsService.setInterviewerSkill(req.params.userId, req.body);
  res.status(201).json(skill);
}

export async function listScorecardTemplatesHandler(_req: Request, res: Response) {
  const templates = await interviewsService.listScorecardTemplates();
  res.json(templates);
}

export async function createScorecardTemplateHandler(req: Request, res: Response) {
  const template = await interviewsService.createScorecardTemplate(req.body);
  res.status(201).json(template);
}

export async function createInterviewHandler(req: Request, res: Response) {
  const interview = await interviewsService.createInterview(req.body);
  res.status(201).json(interview);
}

export async function submitScorecardHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const scorecard = await interviewsService.submitScorecard(req.params.panelistId, req.user.id, req.body);
  res.status(201).json(scorecard);
}
