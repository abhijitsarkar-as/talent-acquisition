import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as requisitionsApi from '../api/endpoints/requisitions.api';
import * as workflowApi from '../api/endpoints/workflow.api';
import { ApiRequestError } from '../api/client';

export function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: requisition } = useQuery({
    queryKey: ['requisitions', id],
    queryFn: () => requisitionsApi.getRequisition(id!),
    enabled: !!id,
  });

  const { data: workflows } = useQuery({
    queryKey: ['workflows', 'REQUISITION'],
    queryFn: () => workflowApi.listWorkflows('REQUISITION'),
  });

  const transition = useMutation({
    mutationFn: (toStageKey: string) => requisitionsApi.transitionRequisition(id!, toStageKey),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : 'Transition failed'),
  });

  const clone = useMutation({
    mutationFn: () => requisitionsApi.cloneRequisition(id!),
    onSuccess: (clonedReq) => navigate(`/requisitions/${clonedReq.id}`),
  });

  if (!requisition) return <div className="p-8 text-gray-500">Loading...</div>;

  const workflow = workflows?.find((w) => w.id === requisition.workflowId);
  const availableTransitions =
    workflow?.transitions.filter(
      (t) => t.fromStageId === requisition.currentStageId || t.allowedFromAnyStage,
    ) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{requisition.title}</h1>
        <div className="flex gap-2">
          <Link to={`/requisitions/${id}/pipeline`} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
            Pipeline Board
          </Link>
          <button onClick={() => clone.mutate()} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
            Clone
          </button>
        </div>
      </div>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <p>
          <span className="font-medium">Stage:</span>{' '}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{requisition.currentStage?.label}</span>
        </p>
        <p className="mt-1">
          <span className="font-medium">Department:</span> {requisition.department}
        </p>
        <p className="mt-1">
          <span className="font-medium">Level:</span> {requisition.level}
        </p>
        <p className="mt-1">
          <span className="font-medium">Locations:</span> {requisition.locations.join(', ')}
        </p>
        <p className="mt-1">
          <span className="font-medium">Priority:</span> {requisition.priority}
        </p>
        {requisition.jdSnapshot && (
          <p className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs text-gray-600">
            {requisition.jdSnapshot}
          </p>
        )}
        {requisition.requiredSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {requisition.requiredSkills.map((s) => (
              <span key={s.id} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {s.skillNode.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium">Available Transitions</p>
        <div className="flex flex-wrap gap-2">
          {availableTransitions.map((t) => (
            <button
              key={t.id}
              onClick={() => transition.mutate(workflow!.stages.find((s) => s.id === t.toStageId)!.key)}
              disabled={transition.isPending}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {t.name}
            </button>
          ))}
          {availableTransitions.length === 0 && <p className="text-sm text-gray-400">No transitions available.</p>}
        </div>
      </div>
    </div>
  );
}
