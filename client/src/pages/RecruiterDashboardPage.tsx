import { useQuery } from '@tanstack/react-query';
import * as reportingApi from '../api/endpoints/reporting.api';
import * as requisitionsApi from '../api/endpoints/requisitions.api';
import { useAuth } from '../auth/AuthContext';
import { useLiveEvents } from '../hooks/useLiveEvents';
import { DASHBOARD_POLL_INTERVAL_MS } from '../hooks/usePolling';

export function RecruiterDashboardPage() {
  useLiveEvents();
  const { user } = useAuth();

  const { data: velocity } = useQuery({
    queryKey: ['reporting', 'velocity', 'individual'],
    queryFn: reportingApi.getIndividualVelocity,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });

  const { data: requisitions } = useQuery({
    queryKey: ['requisitions'],
    queryFn: requisitionsApi.listRequisitions,
    refetchInterval: DASHBOARD_POLL_INTERVAL_MS,
  });

  const myVelocity = velocity?.filter((v) => v.actorId === user?.id) ?? [];
  const myRequisitions = requisitions?.filter((r) => r.recruiterOwnerId === user?.id) ?? [];
  const totalTransitions = myVelocity.reduce((sum, v) => sum + v.transitions, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">My Velocity (transitions performed)</p>
          <p className="mt-2 text-3xl font-semibold">{totalTransitions}</p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            {myVelocity.map((v, i) => (
              <div key={i} className="flex justify-between">
                <span>{v.category ?? 'Uncategorized'}</span>
                <span>{v.transitions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">My Open Requisitions</p>
          <p className="mt-2 text-3xl font-semibold">{myRequisitions.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs uppercase text-gray-500">My Queue</p>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500">
            <tr>
              <th className="py-1">Title</th>
              <th className="py-1">Stage</th>
              <th className="py-1">Priority</th>
            </tr>
          </thead>
          <tbody>
            {myRequisitions.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="py-1">{r.title}</td>
                <td className="py-1">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{r.currentStage?.label}</span>
                </td>
                <td className="py-1">{r.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
