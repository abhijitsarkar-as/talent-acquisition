export interface IndividualVelocityRow {
  actorId: string;
  actorName: string;
  category: string | null;
  transitions: number;
}

export interface TeamVelocityRow {
  category: string | null;
  weekBucket: string;
  transitions: number;
}

export interface FunnelRow {
  stageKey: string;
  stageLabel: string;
  sortOrder: number;
  applicationCount: number;
}

export interface AgingRow {
  applicationId: string;
  candidateName: string;
  stageKey: string;
  stageLabel: string;
  hoursInStage: number;
  slaHours: number | null;
  breached: boolean;
}

export interface InterviewerTurnaroundRow {
  interviewerId: string;
  interviewerName: string;
  interviewId: string;
  scheduledStart: string;
  submittedAt: string | null;
  turnaroundHours: number | null;
}

export interface PipelineSnapshotRow {
  stageId: string;
  stageKey?: string;
  stageLabel?: string;
  count: number;
}

export interface OfferAcceptRate {
  accepted: number;
  declined: number;
  total: number;
  acceptRate: number | null;
}
