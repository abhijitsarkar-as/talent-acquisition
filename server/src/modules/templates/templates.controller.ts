import { Request, Response } from 'express';
import { TemplateType } from '@prisma/client';
import * as templatesService from './templates.service';
import { ApiError } from '../../utils/ApiError';

export async function listTemplatesHandler(req: Request, res: Response) {
  const type = req.query.type as TemplateType | undefined;
  const templates = await templatesService.listTemplates(type);
  res.json(templates);
}

export async function getTemplateHandler(req: Request, res: Response) {
  const template = await templatesService.getTemplate(req.params.id);
  res.json(template);
}

export async function createTemplateHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const template = await templatesService.createTemplate(req.user.id, req.body);
  res.status(201).json(template);
}

export async function approveTemplateHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const template = await templatesService.approveTemplate(req.params.id, req.user.id);
  res.json(template);
}

export async function reviseTemplateHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const template = await templatesService.reviseTemplate(req.params.id, req.user.id, req.body);
  res.status(201).json(template);
}
