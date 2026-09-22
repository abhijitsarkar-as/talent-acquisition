import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as applicationsApi from '../api/endpoints/applications.api';
import * as candidatesApi from '../api/endpoints/candidates.api';
import * as workflowApi from '../api/endpoints/workflow.api';
import * as reportingApi from '../api/endpoints/reporting.api';
import { ApiRequestError } from '../api/client';

export function PipelineBoardPage() {
  const { id: requisitionId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [candidateToAdd, setCandidateToAdd] = useState('');

  const { data: applications } = useQuery({
    queryKey: ['applications', requisitionId],
    queryFn: () => applicationsApi.listApplications(requisitionId),
    enabled: !!requisitionId,
  });

  const { data: workflows } = useQuery({
    queryKey: ['workflows', 'APPLICATION'],
    queryFn: () => workflowApi.listWorkflows('APPLICATION'),
  });

  const { data: candidates } = useQuery({ queryKey: ['candidates'], queryFn: candidatesApi.listCandidates });
  const { data: aging } = useQuery({ queryKey: ['reporting', 'aging'], queryFn: reportingApi.getAging });
  const breachedApplicationIds = new Set(aging?.filter((a) => a.breached).map((a) => a.applicationId));

  const workflow = workflows?.[0];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['applications', requisitionId] });
  }

  const addCandidate = useMutation({
    mutationFn: () => applicationsApi.createApplication({ candidateId: candidateToAdd, requisitionId: requisitionId! }),
    onSuccess: () => {
      invalidate();
      setCandidateToAdd('');
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : 'Failed to add candidate'),
  });

  const transition = useMutation({
    mutationFn: ({ id, toStageKey }: { id: string; toStageKey: string }) =>
      applicationsApi.transitionApplication(id, toStageKey),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : 'Transition failed'),
  });

  const bulkReject = useMutation({
    mutationFn: async () => {
      const reasonCode = window.prompt('Reason code for bulk reject:', 'NOT_A_FIT');
      if (!reasonCode) throw new Error('Reason code is required');
      return applicationsApi.bulkTransitionApplications(Array.from(selected), 'REJECTED', reasonCode);
    },
    onSuccess: () => {
      invalidate();
      setSelected(new Set());
    },
  });

  if (!applications || !workflow) return <div className="p-8 text-gray-500">Loading...</div>;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pipeline Board</h1>
        <div className="flex items-center gap-2">
          <select
            value={candidateToAdd}
            onChange={(e) => setCandidateToAdd(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Add candidate...</option>
            {candidates?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
          <button
            onClick={() => addCandidate.mutate()}
            disabled={!candidateToAdd || addCandidate.isPending}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Add to Pipeline
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => bulkReject.mutate()}
              className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
            >
              Reject {selected.size} selected
            </button>
          )}
        </div>
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3 overflow-x-auto">
        {[...workflow.stages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stage) => {
            const cardsInStage = applications.filter((a) => a.currentStage.id === stage.id);
            const nextTransitions = workflow.transitions.filter(
              (t) => t.fromStageId === stage.id || t.allowedFromAnyStage,
            );

            return (
              <div key={stage.id} className="w-64 flex-shrink-0 rounded-lg bg-gray-100 p-2">
                <p className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
                  {stage.label} ({cardsInStage.length})
                </p>
                <div className="space-y-2">
                  {cardsInStage.map((app) => (
                    <div
                      key={app.id}
                      className={`rounded border p-2 text-sm shadow-sm ${
                        breachedApplicationIds.has(app.id) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selected.has(app.id)}
                            onChange={() => toggleSelect(app.id)}
                          />
                          <Link to={`/applications/${app.id}`} className="font-medium text-blue-600 hover:underline">
                            {app.candidate.firstName} {app.candidate.lastName}
                          </Link>
                        </label>
                        {breachedApplicationIds.has(app.id) && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                            SLA
                          </span>
                        )}
                      </div>
                      {nextTransitions.length > 0 && (
                        <select
                          className="mt-1 w-full rounded border border-gray-200 px-1 py-0.5 text-xs"
                          value=""
                          onChange={(e) => {
                            const toStageKey = workflow.stages.find((s) => s.id === e.target.value)?.key;
                            if (toStageKey) transition.mutate({ id: app.id, toStageKey });
                          }}
                        >
                          <option value="">Move to...</option>
                          {nextTransitions.map((t) => (
                            <option key={t.id} value={t.toStageId}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
