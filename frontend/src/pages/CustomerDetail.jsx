import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { useCompleteFollowUp } from '@/hooks/useCrm';
import { currency, relativeTime } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { StageChip } from '@/components/common/StageChip';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ActivityDialog, CustomerFormDialog, FollowUpDialog, OpportunityDialog } from '@/components/common/RecordDialogs';

export default function CustomerDetail() {
  const { id } = useParams();
  const complete = useCompleteFollowUp();
  const [edit, setEdit] = useState(false);
  const [activity, setActivity] = useState(false);
  const [follow, setFollow] = useState(false);
  const [opportunity, setOpportunity] = useState(false);
  const query = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => (await api.get(`/customers/${id}`)).data.data,
  });
  const customer = query.data;
  useDocumentMeta(customer?.name || 'Customer', [
    { label: 'Customers', to: '/customers' },
    { label: customer?.name || 'Customer' },
  ]);

  if (query.isLoading) return <TableSkeleton rows={4} />;
  if (query.isError || !customer) return <ErrorState message="This customer could not be found." />;

  const record = { kind: 'customer', id: customer._id, label: customer.name };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-heading">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted">{customer.company || 'No company'} · {customer.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setActivity(true)}>Log activity</Button>
          <Button variant="secondary" onClick={() => setFollow(true)}>New follow-up</Button>
          <Button variant="secondary" onClick={() => setOpportunity(true)}>New opportunity</Button>
          <Button onClick={() => setEdit(true)}>Edit customer</Button>
        </div>
      </div>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Contact</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted">Email</dt><dd>{customer.email || 'Not added'}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd>{customer.phone || 'Not added'}</dd></div>
          <div><dt className="text-muted">Company</dt><dd>{customer.company || 'Not added'}</dd></div>
        </dl>
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Opportunities</h2>
        {customer.opportunities?.length ? (
          <ul className="mt-3 divide-y divide-line">
            {customer.opportunities.map((item) => (
              <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium">{item.title}</span>
                <span className="flex items-center gap-3">
                  <StageChip stage={item.stage} />
                  <span className="tabular">{currency(item.value)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="No opportunities yet" description="Add a deal when there is a value attached to this relationship." />}
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Activity</h2>
        {customer.activities?.length ? (
          <ol className="space-y-3">
            {customer.activities.map((item) => (
              <li key={item._id} className="rounded-xl border border-line bg-surface p-3 text-sm">
                <p className="font-medium">{item.type} <span className="font-normal text-muted">{relativeTime(item.date)}</span></p>
                <p className="text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        ) : <EmptyState title="No interactions yet" description="Log a call to start the history." />}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Follow-ups</h2>
        {customer.followUps?.length ? customer.followUps.map((item) => (
          <ContextFollowUpCard key={item._id} item={item} onComplete={(followUp) => complete.mutate(followUp._id)} onLog={() => setActivity(true)} />
        )) : <p className="text-sm text-muted">No follow-ups for this customer.</p>}
      </section>
      <CustomerFormDialog open={edit} onOpenChange={setEdit} customer={customer} />
      <ActivityDialog open={activity} onOpenChange={setActivity} preset={{ type: 'Call', record }} />
      <FollowUpDialog open={follow} onOpenChange={setFollow} preset={{ record }} />
      <OpportunityDialog open={opportunity} onOpenChange={setOpportunity} preset={{ record }} />
    </div>
  );
}
