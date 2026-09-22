import { Request, Response } from 'express';
import * as applicationsService from './applications.service';
import { ApiError } from '../../utils/ApiError';

export async function listApplicationsHandler(req: Request, res: Response) {
  const requisitionId = req.query.requisitionId as string | undefined;
  const applications = await applicationsService.listApplications(requisitionId);
  res.json(applications);
}

export async function getApplicationHandler(req: Request, res: Response) {
  const application = await applicationsService.getApplication(req.params.id);
  res.json(application);
}

export async function createApplicationHandler(req: Request, res: Response) {
  const application = await applicationsService.createApplication(req.body);
  res.status(201).json(application);
}

export async function transitionApplicationHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const application = await applicationsService.transitionApplication(req.params.id, req.user, req.body);
  res.json(application);
}

export async function bulkTransitionApplicationsHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { applicationIds, ...input } = req.body;
  const result = await applicationsService.bulkTransitionApplications(applicationIds, req.user, input);
  res.json(result);
}
