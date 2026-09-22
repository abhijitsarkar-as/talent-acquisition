import { Request, Response } from 'express';
import * as skillTaxonomyService from './skillTaxonomy.service';

export async function listSkillTaxonomyHandler(_req: Request, res: Response) {
  const tree = await skillTaxonomyService.listSkillTaxonomyTree();
  res.json(tree);
}

export async function createSkillNodeHandler(req: Request, res: Response) {
  const node = await skillTaxonomyService.createSkillNode(req.body);
  res.status(201).json(node);
}

export async function updateSkillNodeHandler(req: Request, res: Response) {
  const node = await skillTaxonomyService.updateSkillNode(req.params.id, req.body);
  res.json(node);
}
