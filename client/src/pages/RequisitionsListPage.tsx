import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as requisitionsApi from '../api/endpoints/requisitions.api';

export function RequisitionsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['requisitions'], queryFn: requisitionsApi.listRequisitions });

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Requisitions</h1>
        <Link to="/requisitions/new" className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white">
          New Requisition
        </Link>
      </div>

      <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Priority</th>
            <th className="px-4 py-2">Stage</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((req) => (
            <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2">
                <Link to={`/requisitions/${req.id}`} className="font-medium text-blue-600 hover:underline">
                  {req.title}
                </Link>
              </td>
              <td className="px-4 py-2">{req.department}</td>
              <td className="px-4 py-2">{req.priority}</td>
              <td className="px-4 py-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{req.currentStage?.label}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
