import { useQuery } from '@tanstack/react-query';
import * as reportingApi from '../api/endpoints/reporting.api';
import { useLiveEvents } from '../hooks/useLiveEvents';
import { DASHBOARD_POLL_INTERVAL_MS } from '../hooks/usePolling';

export function TeamDashboardPage() {
  useLiveEvents();

  const { data: snapshot } = useQuery({
    queryKey: ['reporting', 'pipeline-snapshot'],
    queryFn: reportingApi.getPipelineSnapshot,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });
  const { data: funnel } = useQuery({
    queryKey: ['reporting', 'funnel'],
    queryFn: () => reportingApi.getFunnel(),
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });
  const { data: teamVelocity } = useQuery({
    queryKey: ['reporting', 'velocity', 'team'],
    queryFn: reportingApi.getTeamVelocity,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });
  const { data: aging } = useQuery({
    queryKey: ['reporting', 'aging'],
    queryFn: reportingApi.getAging,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });
  const { data: offerAcceptRate } = useQuery({
    queryKey: ['reporting', 'offer-accept-rate'],
    queryFn: reportingApi.getOfferAcceptRate,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team Dashboard</h1>
        <button
          onClick={() => reportingApi.exportPipelineSnapshotCsv()}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          Export Pipeline CSV
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Active Applications by Stage</p>
          <div className="mt-2 space-y-1 text-sm">
            {snapshot?.map((s) => (
              <div key={s.stageId} className="flex justify-between">
                <span>{s.stageLabel}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
            {!snapshot?.length && <p className="text-gray-400">No active applications.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Offer Accept Rate</p>
          <p className="mt-2 text-3xl font-semibold">
            {offerAcceptRate?.acceptRate != null ? `${Math.round(offerAcceptRate.acceptRate * 100)}%` : '—'}
          </p>
          <p className="text-xs text-gray-500">
            {offerAcceptRate?.accepted ?? 0} accepted / {offerAcceptRate?.total ?? 0} decided
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Aging (SLA breaches)</p>
          <p className="mt-2 text-3xl font-semibold">{aging?.filter((a) => a.breached).length ?? 0}</p>
          <p className="text-xs text-gray-500">of {aging?.length ?? 0} active applications</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs uppercase text-gray-500">Funnel</p>
        <div className="space-y-1 text-sm">
          {funnel?.map((f) => (
            <div key={f.stageKey} className="flex items-center gap-2">
              <span className="w-40">{f.stageLabel}</span>
              <div className="h-3 flex-1 rounded bg-gray-100">
                <div
                  className="h-3 rounded bg-blue-500"
                  style={{ width: `${Math.min(100, f.applicationCount * 20)}%` }}
                />
              </div>
              <span className="w-8 text-right font-medium">{f.applicationCount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs uppercase text-gray-500">Team Velocity by Skill Category (weekly)</p>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-1">Category</th>
              <th className="py-1">Week</th>
              <th className="py-1">Transitions</th>
            </tr>
          </thead>
          <tbody>
            {teamVelocity?.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-1">{row.category ?? 'Uncategorized'}</td>
                <td className="py-1">{new Date(row.weekBucket).toLocaleDateString()}</td>
                <td className="py-1 font-medium">{row.transitions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs uppercase text-gray-500">Aging Applications</p>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-1">Candidate</th>
              <th className="py-1">Stage</th>
              <th className="py-1">Hours in Stage</th>
              <th className="py-1">SLA</th>
            </tr>
          </thead>
          <tbody>
            {aging?.map((a) => (
              <tr key={a.applicationId} className={`border-t border-gray-100 ${a.breached ? 'bg-red-50' : ''}`}>
                <td className="py-1">{a.candidateName}</td>
                <td className="py-1">{a.stageLabel}</td>
                <td className="py-1">{Math.round(a.hoursInStage)}h</td>
                <td className="py-1">{a.slaHours ?? '—'}h {a.breached && <span className="text-red-600">(breached)</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
