import type {
  AgingRow,
  FunnelRow,
  IndividualVelocityRow,
  InterviewerTurnaroundRow,
  OfferAcceptRate,
  PipelineSnapshotRow,
  TeamVelocityRow,
} from '@ta/shared';
import { api, downloadFile } from '../client';

export function getPipelineSnapshot() {
  return api.get<PipelineSnapshotRow[]>('/api/reporting/pipeline-snapshot');
}

export function getFunnel(requisitionId?: string) {
  return api.get<FunnelRow[]>('/api/reporting/funnel', requisitionId ? { requisitionId } : undefined);
}

export function getIndividualVelocity() {
  return api.get<IndividualVelocityRow[]>('/api/reporting/velocity/individual');
}

export function getTeamVelocity() {
  return api.get<TeamVelocityRow[]>('/api/reporting/velocity/team');
}

export function getAging() {
  return api.get<AgingRow[]>('/api/reporting/aging');
}

export function getInterviewerTurnaround() {
  return api.get<InterviewerTurnaroundRow[]>('/api/reporting/interviewer-turnaround');
}

export function getOfferAcceptRate() {
  return api.get<OfferAcceptRate>('/api/reporting/offer-accept-rate');
}

export function exportPipelineSnapshotCsv() {
  return downloadFile('/api/reporting/pipeline-snapshot/export.csv', 'pipeline-snapshot.csv');
}
