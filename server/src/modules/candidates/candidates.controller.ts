import { Request, Response } from 'express';
import * as candidatesService from './candidates.service';

export async function listCandidatesHandler(_req: Request, res: Response) {
  const candidates = await candidatesService.listCandidates();
  res.json(candidates);
}

export async function getCandidateHandler(req: Request, res: Response) {
  const candidate = await candidatesService.getCandidate(req.params.id);
  res.json(candidate);
}

export async function createCandidateHandler(req: Request, res: Response) {
  const candidate = await candidatesService.createCandidate(req.body);
  res.status(201).json(candidate);
}

export async function bulkImportCandidatesHandler(req: Request, res: Response) {
  const result = await candidatesService.bulkImportCandidates(req.body.candidates);
  res.status(201).json(result);
}
