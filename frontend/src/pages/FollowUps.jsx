import { useMemo, useState } from 'react';
import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api, { fetchAll } from '@/services/api';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { useCompleteFollowUp } from '@/hooks/useCrm';
import { useStoredState } from '@/hooks/useUi';
import { PRIORITIES } from '@/lib/constants';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { FollowUpDialog, ActivityDialog } from '@/components/common/RecordDialogs';
import { CardSkeleton } from '@/components/ui/skeleton';

const views = ['List', 'Today', 'Calendar'];

export default function FollowUps() {
  useDocumentMeta('Follow-ups', [{ label: 'Follow-ups' }]);
  const complete = useCompleteFollowUp();
  const [filters, setFilters] = useStoredState('smartcrm_followup_filters', { view: 'List', status: '', priority: '' });
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [logFor, setLogFor] = useState(null);

  const query = useQuery({
    queryKey: ['followups', { status: filters.status, priority: filters.priority }],
    queryFn: () => fetchAll('/followups', {
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      limit: 50,
    }),
  });

  const items = query.data || [];
  const todayItems = items.filter((item) => isSameDay(new Date(item.dueDate), new Date()) && item.status !== 'Completed');
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  }), [cursor]);
  const selectedItems = items.filter((item) => isSameDay(new Date(item.dueDate), selectedDay));

  const list = filters.view === 'Today' ? todayItems : items;

  return (
    <div>
      <PageHeader title="Follow-ups" description="Each card keeps the customer, stage, and last conversation with the next action." actions={<Button onClick={() => setOpen(true)}>New follow-up</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="tablist" aria-label="Follow-up view">
          {views.map((view) => (
            <button key={view} type="button" role="tab" aria-selected={filters.view === view} className={`h-8 rounded-md px-3 text-sm ${filters.view === view ? 'bg-primary-soft text-primary' : 'text-muted'}`} onClick={() => setFilters({ ...filters, view })}>
              {view}
            </button>
          ))}
        </div>
        <Select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Overdue</option>
          <option>Completed</option>
        </Select>
        <Select aria-label="Filter by priority" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
          <option value="">All priorities</option>
          {PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
        </Select>
      </div>
      {query.isLoading ? <div className="space-y-3">{[0, 1, 2].map((item) => <CardSkeleton key={item} />)}</div> : null}
      {query.isError ? <ErrorState message="Follow-ups could not be loaded." onRetry={() => query.refetch()} /> : null}
      {query.data && filters.view !== 'Calendar' && !list.length ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            scene={filters.status || filters.priority ? 'search' : 'followups'}
            title={filters.view === 'Today' ? 'Nothing due today' : filters.status || filters.priority ? 'No follow-ups match' : 'No follow-ups yet'}
            description={filters.status || filters.priority ? 'Try another status or priority.' : 'Schedule a follow-up when a conversation needs a next step.'}
            action={filters.status || filters.priority ? null : <Button onClick={() => setOpen(true)}>New follow-up</Button>}
          />
        </div>
      ) : null}
      {filters.view !== 'Calendar' ? (
        <div className="space-y-3">
          {list.map((item) => (
            <ContextFollowUpCard
              key={item._id}
              item={item}
              completing={complete.isPending && complete.variables === item._id}
              onComplete={(follow) => complete.mutate(follow._id)}
              onLog={(follow) => setLogFor(follow)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="secondary" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>Previous</Button>
            <p className="text-sm font-medium">{format(cursor, 'MMMM yyyy')}</p>
            <Button variant="secondary" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Next</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-1">{day}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const count = items.filter((item) => isSameDay(new Date(item.dueDate), day) && item.status !== 'Completed').length;
              const selected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-14 rounded-lg border p-1 text-left text-xs ${selected ? 'border-primary bg-primary-soft' : 'border-line'} ${isSameMonth(day, cursor) ? 'text-ink' : 'text-muted'}`}
                >
                  <span className="tabular">{format(day, 'd')}</span>
                  {count ? <span className="mt-1 block text-[11px] text-primary">{count} due</span> : null}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-3">
            <h2 className="text-sm font-medium">{format(selectedDay, 'EEEE, d MMMM')}</h2>
            {selectedItems.length ? selectedItems.map((item) => (
              <ContextFollowUpCard key={item._id} item={item} onComplete={(follow) => complete.mutate(follow._id)} onLog={(follow) => setLogFor(follow)} />
            )) : <p className="text-sm text-muted">No follow-ups on this day.</p>}
          </div>
        </div>
      )}
      <FollowUpDialog open={open} onOpenChange={setOpen} />
      <ActivityDialog
        open={Boolean(logFor)}
        onOpenChange={(next) => !next && setLogFor(null)}
        preset={logFor ? {
          type: 'Call',
          record: logFor.leadId
            ? { kind: 'lead', id: logFor.leadId, label: logFor.context?.name }
            : { kind: 'customer', id: logFor.customerId, label: logFor.context?.name },
        } : null}
      />
    </div>
  );
}
