import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { SkillTaxonomyNodeDto } from '@ta/shared';
import * as requisitionsApi from '../api/endpoints/requisitions.api';
import * as templatesApi from '../api/endpoints/templates.api';
import * as usersApi from '../api/endpoints/users.api';
import * as skillTaxonomyApi from '../api/endpoints/skillTaxonomy.api';
import { ApiRequestError } from '../api/client';

function flattenSkills(tree: SkillTaxonomyNodeDto[]): SkillTaxonomyNodeDto[] {
  const skills: SkillTaxonomyNodeDto[] = [];
  for (const category of tree) {
    for (const skill of category.children ?? []) {
      if (skill.type === 'SKILL') skills.push(skill);
    }
  }
  return skills;
}

export function RequisitionFormPage() {
  const navigate = useNavigate();
  const { data: templates } = useQuery({ queryKey: ['templates', 'JD'], queryFn: () => templatesApi.listTemplates('JD') });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersApi.listUsers });
  const { data: skillTree } = useQuery({ queryKey: ['skillTaxonomy'], queryFn: skillTaxonomyApi.listSkillTaxonomy });

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [locations, setLocations] = useState('Remote');
  const [jdTemplateId, setJdTemplateId] = useState('');
  const [recruiterOwnerId, setRecruiterOwnerId] = useState('');
  const [hiringManagerId, setHiringManagerId] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const approvedJdTemplates = templates?.filter((t) => t.isApproved) ?? [];
  const skills = skillTree ? flattenSkills(skillTree) : [];

  const createRequisition = useMutation({
    mutationFn: () =>
      requisitionsApi.createRequisition({
        title,
        department,
        level,
        employmentType,
        locations: locations.split(',').map((l) => l.trim()).filter(Boolean),
        jdTemplateId: jdTemplateId || null,
        recruiterOwnerId,
        hiringManagerId,
        requiredSkills: selectedSkillIds.map((skillNodeId) => ({ skillNodeId })),
      }),
    onSuccess: (req) => navigate(`/requisitions/${req.id}`),
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : 'Failed to create requisition'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    createRequisition.mutate();
  }

  function toggleSkill(id: string) {
    setSelectedSkillIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">New Requisition</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Department
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Level
            <input
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <label className="text-sm">
            Employment Type
            <input
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
          <label className="col-span-2 text-sm">
            Locations (comma-separated)
            <input
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
        </div>

        <label className="block text-sm">
          JD Template (approved only)
          <select
            value={jdTemplateId}
            onChange={(e) => setJdTemplateId(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
          >
            <option value="">None</option>
            {approvedJdTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Recruiter Owner
            <select
              value={recruiterOwnerId}
              onChange={(e) => setRecruiterOwnerId(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            >
              <option value="">Select...</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Hiring Manager
            <select
              value={hiringManagerId}
              onChange={(e) => setHiringManagerId(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            >
              <option value="">Select...</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <p className="text-sm font-medium">Required Skills</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-1 rounded-full border border-gray-300 px-2 py-1 text-xs">
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggleSkill(skill.id)}
                />
                {skill.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={createRequisition.isPending}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Create Requisition
        </button>
      </form>
    </div>
  );
}
