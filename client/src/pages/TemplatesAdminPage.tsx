import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TemplateType } from '@ta/shared';
import * as templatesApi from '../api/endpoints/templates.api';

const TEMPLATE_TYPES: TemplateType[] = ['JD', 'EMAIL', 'OFFER_LETTER'];

export function TemplatesAdminPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['templates'], queryFn: () => templatesApi.listTemplates() });

  const [type, setType] = useState<TemplateType>('JD');
  const [name, setName] = useState('');
  const [roleFamily, setRoleFamily] = useState('');
  const [body, setBody] = useState('');

  const createTemplate = useMutation({
    mutationFn: () =>
      templatesApi.createTemplate({
        type,
        name,
        roleFamily: roleFamily || undefined,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setName('');
      setRoleFamily('');
      setBody('');
    },
  });

  const approveTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.approveTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createTemplate.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Templates</h1>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-dashed border-gray-300 p-4">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TemplateType)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {TEMPLATE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            required
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <input
            value={roleFamily}
            onChange={(e) => setRoleFamily(e.target.value)}
            placeholder="Role family (optional)"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body, e.g. We are hiring a {{level}} Backend Engineer for {{team}}."
          required
          rows={3}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={createTemplate.isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Create template
        </button>
      </form>

      <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Version</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((template) => (
            <tr key={template.id} className="border-t border-gray-100">
              <td className="px-4 py-2">{template.name}</td>
              <td className="px-4 py-2">{template.type}</td>
              <td className="px-4 py-2">v{template.version}</td>
              <td className="px-4 py-2">
                {template.isApproved ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Approved</span>
                ) : (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    Pending approval
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                {!template.isApproved && (
                  <button
                    onClick={() => approveTemplate.mutate(template.id)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
