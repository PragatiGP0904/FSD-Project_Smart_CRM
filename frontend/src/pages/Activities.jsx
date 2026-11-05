import { useMemo, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api, { fetchAll } from '@/services/api';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { useStoredState } from '@/hooks/useUi';
import { ACTIVITY_TYPES } from '@/lib/constants';
import { dateTime } from '@/lib/format';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ActivityDialog } from '@/components/common/RecordDialogs';

export default function Activities() {
  useDocumentMeta('Activities', [{ label: 'Activities' }]);
  const [filters, setFilters] = useStoredState('smartcrm_activity_filters', { type: '' });
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => fetchAll('/activities', { type: filters.type || undefined, limit: 50 }),
  });

  const groups = useMemo(() => {
    const map = new Map();
    (query.data || []).forEach((activity) => {
      const key = format(new Date(activity.date), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(activity);
    });
    return [...map.entries()];
  }, [query.data]);

  return (
    <div>
      <PageHeader title="Activities" description="Calls, meetings, emails, and notes in the order they happened." actions={<Button onClick={() => setOpen(true)}>Log activity</Button>} />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <button type="button" aria-pressed={!filters.type} className={`h-8 rounded-full border px-3 text-sm ${!filters.type ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`} onClick={() => setFilters({ type: '' })}>All</button>
        {ACTIVITY_TYPES.map((type) => (
          <button key={type} type="button" aria-pressed={filters.type === type} className={`h-8 rounded-full border px-3 text-sm ${filters.type === type ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`} onClick={() => setFilters({ type })}>
            {type}
          </button>
        ))}
      </div>
      {query.isLoading ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState message="Activities could not be loaded." onRetry={() => query.refetch()} /> : null}
      {query.data && !query.data.length ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState scene={filters.type ? 'search' : 'activity'} title={filters.type ? 'No interactions of this type' : 'No interactions yet'} description={filters.type ? 'Try another type, or log one.' : 'Log a call, meeting, email, or note.'} action={<Button onClick={() => setOpen(true)}>Log activity</Button>} />
        </div>
      ) : null}
      <div className="space-y-6">
        {groups.map(([day, items]) => (
          <section key={day}>
            <h2 className="mb-2 text-sm font-medium text-muted">{isSameDay(new Date(day), new Date()) ? 'Today' : format(new Date(day), 'EEEE, d MMMM')}</h2>
            <ol className="space-y-2">
              {items.map((activity) => (
                <li key={activity._id} className="rounded-xl border border-line bg-surface p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{activity.type} · {activity.subjectName || 'Record'}</p>
                    <p className="text-xs text-muted tabular">{dateTime(activity.date)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{activity.description}</p>
                  {activity.subjectCompany ? <p className="mt-1 text-xs text-muted">{activity.subjectCompany}</p> : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <ActivityDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
