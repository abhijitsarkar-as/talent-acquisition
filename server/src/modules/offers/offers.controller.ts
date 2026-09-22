import { Request, Response } from 'express';
import * as offersService from './offers.service';
import { ApiError } from '../../utils/ApiError';

export async function listOffersHandler(req: Request, res: Response) {
  const applicationId = req.query.applicationId as string | undefined;
  const offers = await offersService.listOffers(applicationId);
  res.json(offers);
}

export async function getOfferHandler(req: Request, res: Response) {
  const offer = await offersService.getOffer(req.params.id);
  res.json(offer);
}

export async function createOfferHandler(req: Request, res: Response) {
  const offer = await offersService.createOffer(req.body);
  res.status(201).json(offer);
}

export async function decideApprovalHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const offer = await offersService.decideApproval(req.params.id, req.params.approvalId, req.user, req.body);
  res.json(offer);
}

export async function respondToOfferHandler(req: Request, res: Response) {
  const offer = await offersService.respondToOffer(req.params.id, req.body.status);
  res.json(offer);
}

export async function negotiateOfferHandler(req: Request, res: Response) {
  const offer = await offersService.negotiateOffer(req.params.id);
  res.json(offer);
}
