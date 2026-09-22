import { Request, Response } from 'express';
import * as requisitionsService from './requisitions.service';
import { ApiError } from '../../utils/ApiError';

export async function listRequisitionsHandler(_req: Request, res: Response) {
  const requisitions = await requisitionsService.listRequisitions();
  res.json(requisitions);
}

export async function getRequisitionHandler(req: Request, res: Response) {
  const requisition = await requisitionsService.getRequisition(req.params.id);
  res.json(requisition);
}

export async function createRequisitionHandler(req: Request, res: Response) {
  const requisition = await requisitionsService.createRequisition(req.body);
  res.status(201).json(requisition);
}

export async function cloneRequisitionHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const requisition = await requisitionsService.cloneRequisition(req.params.id, req.user.id);
  res.status(201).json(requisition);
}

export async function transitionRequisitionHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const requisition = await requisitionsService.transitionRequisition(req.params.id, req.user, req.body);
  res.json(requisition);
}
