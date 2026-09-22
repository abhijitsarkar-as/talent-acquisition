import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SkillTaxonomyNodeDto } from '@ta/shared';
import * as skillTaxonomyApi from '../api/endpoints/skillTaxonomy.api';

function AddNodeForm({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: (name: string) => Promise<unknown>;
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={label}
        className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-gray-900 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

function SkillNode({ skill }: { skill: SkillTaxonomyNodeDto }) {
  const queryClient = useQueryClient();
  const createLevel = useMutation({
    mutationFn: (name: string) =>
      skillTaxonomyApi.createSkillNode({ type: 'PROFICIENCY_LEVEL', name, parentId: skill.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skillTaxonomy'] }),
  });

  return (
    <div className="ml-6 border-l border-gray-200 pl-4 py-2">
      <p className="text-sm font-medium">{skill.name}</p>
      <ul className="ml-2 mt-1 flex flex-wrap gap-2">
        {skill.children?.map((level) => (
          <li key={level.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {level.name}
          </li>
        ))}
      </ul>
      <AddNodeForm label="New proficiency level" onSubmit={(name) => createLevel.mutateAsync(name)} />
    </div>
  );
}

function CategoryNode({ category }: { category: SkillTaxonomyNodeDto }) {
  const queryClient = useQueryClient();
  const createSkill = useMutation({
    mutationFn: (name: string) => skillTaxonomyApi.createSkillNode({ type: 'SKILL', name, parentId: category.id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skillTaxonomy'] }),
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">{category.name}</h2>
      {category.children?.map((skill) => <SkillNode key={skill.id} skill={skill} />)}
      <div className="ml-6">
        <AddNodeForm label="New skill" onSubmit={(name) => createSkill.mutateAsync(name)} />
      </div>
    </div>
  );
}

export function SkillTaxonomyAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['skillTaxonomy'],
    queryFn: skillTaxonomyApi.listSkillTaxonomy,
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => skillTaxonomyApi.createSkillNode({ type: 'CATEGORY', name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skillTaxonomy'] }),
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Skill Taxonomy</h1>
      <div className="rounded-lg border border-dashed border-gray-300 p-4">
        <AddNodeForm label="New category" onSubmit={(name) => createCategory.mutateAsync(name)} />
      </div>
      <div className="space-y-4">
        {data?.map((category) => <CategoryNode key={category.id} category={category} />)}
      </div>
    </div>
  );
}
