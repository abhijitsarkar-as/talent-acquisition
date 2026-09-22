import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScorecardRecommendation, UserRole } from '@ta/shared';
import * as applicationsApi from '../api/endpoints/applications.api';
import * as interviewsApi from '../api/endpoints/interviews.api';
import * as offersApi from '../api/endpoints/offers.api';
import * as requisitionsApi from '../api/endpoints/requisitions.api';
import * as templatesApi from '../api/endpoints/templates.api';
import * as commentsApi from '../api/endpoints/comments.api';
import * as usersApi from '../api/endpoints/users.api';
import { useAuth } from '../auth/AuthContext';
import { ApiRequestError } from '../api/client';

const RECOMMENDATIONS: ScorecardRecommendation[] = ['STRONG_HIRE', 'HIRE', 'NO_HIRE', 'STRONG_NO_HIRE'];

function ScheduleInterviewForm({ applicationId, requisitionId }: { applicationId: string; requisitionId: string }) {
  const queryClient = useQueryClient();
  const { data: panelists } = useQuery({
    queryKey: ['eligiblePanelists', requisitionId],
    queryFn: () => interviewsApi.listEligiblePanelists(requisitionId),
  });
  const [stageLabel, setStageLabel] = useState('Onsite');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [interviewerId, setInterviewerId] = useState('');

  const schedule = useMutation({
    mutationFn: () =>
      interviewsApi.createInterview({
        applicationId,
        stageLabel,
        scheduledStart: new Date(start).toISOString(),
        scheduledEnd: new Date(end).toISOString(),
        interviewerIds: [interviewerId],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews', applicationId] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    schedule.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded border border-dashed border-gray-300 p-3 text-sm">
      <input value={stageLabel} onChange={(e) => setStageLabel(e.target.value)} placeholder="Stage label" className="rounded border border-gray-300 px-2 py-1" />
      <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required className="rounded border border-gray-300 px-2 py-1" />
      <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required className="rounded border border-gray-300 px-2 py-1" />
      <select value={interviewerId} onChange={(e) => setInterviewerId(e.target.value)} required className="rounded border border-gray-300 px-2 py-1">
        <option value="">Select panelist (skill-matched)...</option>
        {panelists?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.matchedSkills.join(', ')})
          </option>
        ))}
      </select>
      <button type="submit" disabled={schedule.isPending} className="rounded bg-gray-900 px-3 py-1.5 text-white disabled:opacity-50">
        Schedule
      </button>
    </form>
  );
}

function ScorecardForm({ panelistId, skillNodeId }: { panelistId: string; skillNodeId: string }) {
  const queryClient = useQueryClient();
  const { data: templates } = useQuery({ queryKey: ['scorecardTemplates'], queryFn: interviewsApi.listScorecardTemplates });
  const [templateId, setTemplateId] = useState('');
  const [recommendation, setRecommendation] = useState<ScorecardRecommendation>('HIRE');
  const [rating, setRating] = useState(3);

  const submit = useMutation({
    mutationFn: () =>
      interviewsApi.submitScorecard(panelistId, {
        templateId,
        recommendation,
        competencyRatings: [{ skillNodeId, rating }],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interviews'] }),
  });

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2 rounded bg-gray-50 p-2 text-xs">
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="rounded border border-gray-300 px-1 py-0.5">
        <option value="">Template...</option>
        {templates?.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <select value={recommendation} onChange={(e) => setRecommendation(e.target.value as ScorecardRecommendation)} className="rounded border border-gray-300 px-1 py-0.5">
        {RECOMMENDATIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-14 rounded border border-gray-300 px-1 py-0.5" />
      <button
        onClick={() => submit.mutate()}
        disabled={!templateId || submit.isPending}
        className="rounded bg-gray-900 px-2 py-1 text-white disabled:opacity-50"
      >
        Submit Scorecard
      </button>
    </div>
  );
}

function OfferSection({ applicationId }: { applicationId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: offers } = useQuery({ queryKey: ['offers', applicationId], queryFn: () => offersApi.listOffers(applicationId) });
  const { data: offerTemplates } = useQuery({ queryKey: ['templates', 'OFFER_LETTER'], queryFn: () => templatesApi.listTemplates('OFFER_LETTER') });
  const [templateId, setTemplateId] = useState('');
  const [base, setBase] = useState(150000);

  const createOffer = useMutation({
    mutationFn: () =>
      offersApi.createOffer({
        applicationId,
        templateId,
        compensation: { base, currency: 'USD' },
        approverRoles: ['HIRING_MANAGER', 'HRBP'] as UserRole[],
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers', applicationId] }),
  });

  const decide = useMutation({
    mutationFn: ({ offerId, approvalId, status }: { offerId: string; approvalId: string; status: 'APPROVED' | 'REJECTED' }) =>
      offersApi.decideApproval(offerId, approvalId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers', applicationId] }),
  });

  const respond = useMutation({
    mutationFn: ({ offerId, status }: { offerId: string; status: 'ACCEPTED' | 'DECLINED' }) =>
      offersApi.respondToOffer(offerId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers', applicationId] }),
  });

  const approvedOfferTemplates = offerTemplates?.filter((t) => t.isApproved) ?? [];

  return (
    <div className="space-y-3">
      {(!offers || offers.length === 0) && (
        <div className="flex flex-wrap items-end gap-2 rounded border border-dashed border-gray-300 p-3 text-sm">
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="rounded border border-gray-300 px-2 py-1">
            <option value="">Offer letter template...</option>
            {approvedOfferTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input type="number" value={base} onChange={(e) => setBase(Number(e.target.value))} className="w-28 rounded border border-gray-300 px-2 py-1" />
          <button
            onClick={() => createOffer.mutate()}
            disabled={!templateId || createOffer.isPending}
            className="rounded bg-gray-900 px-3 py-1.5 text-white disabled:opacity-50"
          >
            Create Offer
          </button>
        </div>
      )}

      {offers?.map((offer) => (
        <div key={offer.id} className="rounded border border-gray-200 bg-white p-3 text-sm">
          <p>
            <span className="font-medium">Status:</span>{' '}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{offer.status}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Base: {offer.compensation.base} {offer.compensation.currency}
          </p>
          <div className="mt-2 space-y-1">
            {offer.approvals.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <span className="w-32">{a.approverRole}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5">{a.status}</span>
                {a.status === 'PENDING' && user?.role === a.approverRole && (
                  <>
                    <button
                      onClick={() => decide.mutate({ offerId: offer.id, approvalId: a.id, status: 'APPROVED' })}
                      className="text-green-700 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decide.mutate({ offerId: offer.id, approvalId: a.id, status: 'REJECTED' })}
                      className="text-red-700 hover:underline"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          {(offer.status === 'EXTENDED' || offer.status === 'NEGOTIATING') && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => respond.mutate({ offerId: offer.id, status: 'ACCEPTED' })}
                className="rounded border border-green-300 px-2 py-1 text-xs text-green-700"
              >
                Record Accepted
              </button>
              <button
                onClick={() => respond.mutate({ offerId: offer.id, status: 'DECLINED' })}
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
              >
                Record Declined
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CommentsSection({ applicationId }: { applicationId: string }) {
  const queryClient = useQueryClient();
  const { data: comments } = useQuery({
    queryKey: ['comments', applicationId],
    queryFn: () => commentsApi.listComments({ applicationId }),
  });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersApi.listUsers });

  const [body, setBody] = useState('');
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const post = useMutation({
    mutationFn: () => commentsApi.createComment({ applicationId, body, mentionedUserIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', applicationId] });
      setBody('');
      setMentionedUserIds([]);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    post.mutate();
  }

  function toggleMention(userId: string) {
    setMentionedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {comments?.map((c) => (
          <div key={c.id} className="rounded border border-gray-200 bg-white p-2 text-sm">
            <p className="text-xs font-medium text-gray-700">{c.author.name}</p>
            <p>{c.body}</p>
          </div>
        ))}
        {!comments?.length && <p className="text-sm text-gray-400">No comments yet.</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2 rounded border border-dashed border-gray-300 p-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Mention:</span>
          {users?.map((u) => (
            <label key={u.id} className="flex items-center gap-1 rounded-full border border-gray-300 px-2 py-0.5 text-xs">
              <input type="checkbox" checked={mentionedUserIds.includes(u.id)} onChange={() => toggleMention(u.id)} />
              {u.name}
            </label>
          ))}
          <button type="submit" disabled={post.isPending} className="ml-auto rounded bg-gray-900 px-3 py-1 text-xs text-white disabled:opacity-50">
            Post
          </button>
        </div>
      </form>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: application } = useQuery({
    queryKey: ['applications', 'detail', id],
    queryFn: () => applicationsApi.getApplication(id!),
    enabled: !!id,
  });

  const { data: interviews } = useQuery({
    queryKey: ['interviews', id],
    queryFn: () => interviewsApi.listInterviews(id),
    enabled: !!id,
  });

  const { data: requisition } = useQuery({
    queryKey: ['requisitions', application?.requisitionId],
    queryFn: () => requisitionsApi.getRequisition(application!.requisitionId),
    enabled: !!application,
  });

  if (!application) return <div className="p-8 text-gray-500">Loading...</div>;

  const requiredSkillId = requisition?.requiredSkills[0]?.skillNodeId;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {application.candidate.firstName} {application.candidate.lastName}
        </h1>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{application.currentStage.label}</span>
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium">Interviews</h2>
        {id && requisition && <ScheduleInterviewForm applicationId={id} requisitionId={requisition.id} />}
        <div className="mt-3 space-y-2">
          {interviews?.map((interview) => (
            <div key={interview.id} className="rounded border border-gray-200 bg-white p-3 text-sm">
              <p className="font-medium">{interview.stageLabel}</p>
              <p className="text-xs text-gray-500">
                {new Date(interview.scheduledStart).toLocaleString()} - {new Date(interview.scheduledEnd).toLocaleTimeString()}
              </p>
              {interview.panelists.map((p) => (
                <div key={p.id} className="mt-2 border-t border-gray-100 pt-2">
                  <p className="text-xs">
                    {p.interviewer.name} —{' '}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{p.status}</span>
                  </p>
                  {p.status === 'ASSIGNED' && user?.id === p.interviewerId && requiredSkillId && (
                    <ScorecardForm panelistId={p.id} skillNodeId={requiredSkillId} />
                  )}
                  {p.scorecard && (
                    <p className="mt-1 text-xs text-gray-600">
                      Recommendation: <span className="font-medium">{p.scorecard.recommendation}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Offer</h2>
        {id && <OfferSection applicationId={id} />}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Comments</h2>
        {id && <CommentsSection applicationId={id} />}
      </section>
    </div>
  );
}
