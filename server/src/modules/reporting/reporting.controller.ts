import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import * as reportingService from './reporting.service';
import { ApiError } from '../../utils/ApiError';

export async function timeInStageHandler(req: Request, res: Response) {
  const requisitionId = req.query.requisitionId as string | undefined;
  res.json(await reportingService.getTimeInStageReport(requisitionId));
}

export async function individualVelocityHandler(req: Request, res: Response) {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  res.json(await reportingService.getIndividualVelocityReport(from, to));
}

export async function teamVelocityHandler(_req: Request, res: Response) {
  res.json(await reportingService.getTeamVelocityReport());
}

export async function funnelHandler(req: Request, res: Response) {
  const requisitionId = req.query.requisitionId as string | undefined;
  res.json(await reportingService.getFunnelReport(requisitionId));
}

export async function agingHandler(_req: Request, res: Response) {
  res.json(await reportingService.getAgingReport());
}

export async function interviewerTurnaroundHandler(_req: Request, res: Response) {
  res.json(await reportingService.getInterviewerTurnaroundReport());
}

export async function pipelineSnapshotHandler(_req: Request, res: Response) {
  res.json(await reportingService.getPipelineSnapshot());
}

export async function offerAcceptRateHandler(_req: Request, res: Response) {
  res.json(await reportingService.getOfferAcceptRate());
}

export async function listSavedReportsHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await reportingService.listSavedReports(req.user.id));
}

export async function createSavedReportHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  res.status(201).json(await reportingService.createSavedReport(req.user.id, req.body));
}

export async function exportPipelineSnapshotCsvHandler(_req: Request, res: Response) {
  const snapshot = await reportingService.getPipelineSnapshot();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Pipeline Snapshot');
  sheet.columns = [
    { header: 'Stage', key: 'stageLabel', width: 24 },
    { header: 'Stage Key', key: 'stageKey', width: 20 },
    { header: 'Active Applications', key: 'count', width: 20 },
  ];
  sheet.addRows(snapshot);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pipeline-snapshot.csv"');
  await workbook.csv.write(res);
  res.end();
}
