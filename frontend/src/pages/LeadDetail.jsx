import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { useCompleteFollowUp } from '@/hooks/useCrm';
import { dateTime, relativeTime } from '@/lib/format';
import { Tabs, TabContent, TabList, TabTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StageChip } from '@/components/common/StageChip';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ActivityDialog, FollowUpDialog, LeadFormDialog } from '@/components/common/RecordDialogs';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function LeadDetail() {
  const { id } = useParams();
  const complete = useCompleteFollowUp();
  const [tab, setTab] = useState('overview');
  const [edit, setEdit] = useState(false);
  const [activity, setActivity] = useState(false);
  const [follow, setFollow] = useState(false);
  const query = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => (await api.get(`/leads/${id}`)).data.data,
  });
  const lead = query.data;
  useDocumentMeta(lead?.name || 'Lead', [
    { label: 'Leads', to: '/leads' },
    { label: lead?.name || 'Lead' },
  ]);

  if (query.isLoading) return <TableSkeleton rows={4} />;
  if (query.isError || !lead) return <ErrorState message="This lead could not be found." />;

  const record = { kind: 'lead', id: lead._id, label: lead.name };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-heading">{lead.name}</h1>
          <p className="mt-1 text-sm text-muted">{lead.company || 'No company'} · {lead.source}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setActivity(true)}>Log activity</Button>
          <Button variant="secondary" onClick={() => setFollow(true)}>New follow-up</Button>
          <Button onClick={() => setEdit(true)}>Edit lead</Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabList>
          <TabTrigger value="overview">Overview</TabTrigger>
          <TabTrigger value="activity">Activity</TabTrigger>
          <TabTrigger value="followups">Follow-ups</TabTrigger>
        </TabList>
        <TabContent value="overview" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-xl border border-line bg-surface p-4">
            <StageChip stage={lead.stage} />
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Email</dt><dd>{lead.email || 'Not added'}</dd></div>
              <div><dt className="text-muted">Phone</dt><dd>{lead.phone || 'Not added'}</dd></div>
              <div><dt className="text-muted">Created</dt><dd>{dateTime(lead.createdAt)}</dd></div>
              <div><dt className="text-muted">Stage since</dt><dd>{relativeTime(lead.stageUpdatedAt)}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted">{lead.notes || 'No notes yet.'}</p>
            <div className="mt-5 border-t border-line pt-4">
              <h2 className="text-sm font-medium">Recent interactions</h2>
              {lead.activities?.length ? (
                <ol className="mt-3 space-y-3">
                  {lead.activities.slice(0, 3).map((item) => (
                    <li key={item._id}>
                      <p className="text-sm font-medium">{item.type} <span className="font-normal text-muted">{relativeTime(item.date)}</span></p>
                      <p className="text-sm text-muted">{item.description}</p>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-2 text-sm text-muted">No interactions yet.</p>}
            </div>
          </section>
          <aside className="space-y-3">
            {lead.followUps?.filter((item) => item.status !== 'Completed').slice(0, 1).map((item) => (
              <ContextFollowUpCard
                key={item._id}
                item={item}
                onComplete={(followUp) => complete.mutate(followUp._id)}
                onLog={() => setActivity(true)}
              />
            ))}
            {!lead.followUps?.some((item) => item.status !== 'Completed') && (
              <div className="rounded-xl border border-line bg-surface p-4">
                <h2 className="text-sm font-medium">Next action</h2>
                <p className="mt-2 text-sm text-muted">No open follow-up for this lead.</p>
                <Button className="mt-3" variant="secondary" onClick={() => setFollow(true)}>Schedule follow-up</Button>
              </div>
            )}
          </aside>
        </TabContent>
        <TabContent value="activity">
          {lead.activities?.length ? (
            <ol className="space-y-3">
              {lead.activities.map((item) => (
                <li key={item._id} className="rounded-xl border border-line bg-surface p-3">
                  <p className="text-sm font-medium">{item.type} <span className="font-normal text-muted">{relativeTime(item.date)}</span></p>
                  <p className="text-sm text-muted">{item.description}</p>
                </li>
              ))}
            </ol>
          ) : <EmptyState title="No interactions yet" description="Log the first call, meeting, email, or note." />}
        </TabContent>
        <TabContent value="followups" className="space-y-3">
          {lead.followUps?.length ? lead.followUps.map((item) => (
            <ContextFollowUpCard key={item._id} item={item} onComplete={(followUp) => complete.mutate(followUp._id)} onLog={() => setActivity(true)} />
          )) : <EmptyState title="No follow-ups yet" description="Schedule the next action for this lead." />}
        </TabContent>
      </Tabs>
      <LeadFormDialog open={edit} onOpenChange={setEdit} lead={lead} />
      <ActivityDialog open={activity} onOpenChange={setActivity} preset={{ type: 'Call', record }} />
      <FollowUpDialog open={follow} onOpenChange={setFollow} preset={{ record }} />
    </div>
  );
}
