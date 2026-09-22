import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as candidatesApi from '../api/endpoints/candidates.api';
import { ApiRequestError } from '../api/client';

export function CandidatesListPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['candidates'], queryFn: candidatesApi.listCandidates });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [sourceChannel, setSourceChannel] = useState('REFERRAL');
  const [error, setError] = useState<string | null>(null);

  const createCandidate = useMutation({
    mutationFn: () => candidatesApi.createCandidate({ firstName, lastName, email, sourceChannel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      setFirstName('');
      setLastName('');
      setEmail('');
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : 'Failed to create candidate'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createCandidate.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Candidates</h1>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-gray-300 p-4">
        {error && <p className="w-full rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          required
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <select
          value={sourceChannel}
          onChange={(e) => setSourceChannel(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="REFERRAL">Referral</option>
          <option value="JOB_BOARD">Job Board</option>
          <option value="AGENCY">Agency</option>
          <option value="INBOUND">Inbound</option>
        </select>
        <button
          type="submit"
          disabled={createCandidate.isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Add candidate
        </button>
      </form>

      <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((c) => (
            <tr key={c.id} className="border-t border-gray-100">
              <td className="px-4 py-2">
                {c.firstName} {c.lastName}
              </td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.sourceChannel ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
