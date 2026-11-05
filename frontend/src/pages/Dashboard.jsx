import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { useCompleteFollowUp } from '@/hooks/useCrm';
import { currency, fullDate, greeting, relativeTime, todayLabel, trendLabel } from '@/lib/format';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/EmptyState';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { StageChart } from '@/components/charts/StageChart';
import { LeadsOverTimeChart } from '@/components/charts/LeadsOverTimeChart';
import { ActivityDialog } from '@/components/common/RecordDialogs';
import { EmptyState } from '@/components/common/EmptyState';

const cards = [
  { key: 'totalLeads', label: 'Total leads', trend: 'leads' },
  { key: 'activeOpportunities', label: 'Active opportunities', trend: 'opportunities' },
  { key: 'pendingFollowUps', label: 'Pending follow-ups' },
  { key: 'totalActivities', label: 'Activities recorded', trend: 'activities' },
];

export default function Dashboard() {
  useDocumentMeta('Dashboard', [{ label: 'Dashboard' }]);
  const { user } = useAuth();
  const complete = useCompleteFollowUp();
  const [logFor, setLogFor] = useState(null);
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data.data,
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <CardSkeleton key={card.key} />)}
      </div>
    );
  }
  if (query.isError) return <ErrorState message="The dashboard could not be loaded." onRetry={() => query.refetch()} />;

  const data = query.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-heading">{greeting(user?.name)}</h1>
        <p className="text-sm text-muted">{todayLabel()}</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const trend = card.trend ? trendLabel(data.trends?.[card.trend]?.current, data.trends?.[card.trend]?.previous) : '';
          return (
            <article key={card.key} className="rounded-2xl border border-line bg-surface p-4 transition-shadow duration-200 hover:shadow-overlay">
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-xl font-semibold tabular tracking-heading">{data[card.key]}</p>
              {trend ? <p className="mt-2 text-xs text-muted tabular">{trend}</p> : <p className="mt-2 text-xs text-muted">From your records</p>}
            </article>
          );
        })}
      </section>
      <p className="text-sm text-muted">Open pipeline value <span className="font-medium text-ink tabular">{currency(data.pipelineValue)}</span></p>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Next up</h2>
            <Link className="text-sm text-primary" to="/follow-ups">All follow-ups</Link>
          </div>
          {data.upcomingFollowUps?.length ? (
            <div className="space-y-3">
              {data.upcomingFollowUps.slice(0, 3).map((item) => (
                <ContextFollowUpCard
                  key={item._id}
                  item={item}
                  onComplete={(follow) => complete.mutate(follow._id)}
                  completing={complete.isPending && complete.variables === item._id}
                  onLog={(follow) => setLogFor(follow)}
                />
              ))}
            </div>
          ) : (
            <EmptyState compact scene="followups" title="No follow-ups waiting" description="Schedule one when a conversation needs a next step." />
          )}
        </section>
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Stage distribution</h2>
          <StageChart distribution={data.stageDistribution} />
        </section>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold">Leads added</h2>
          <LeadsOverTimeChart points={data.leadsOverTime} />
        </section>
        <section className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <Link className="text-sm text-primary" to="/activities">View all</Link>
          </div>
          {data.recentActivities?.length ? (
            <ol className="space-y-3">
              {data.recentActivities.map((activity) => (
                <li key={activity._id} className="border-l border-line pl-3">
                  <p className="text-sm">
                    <span className="font-medium">{activity.type}</span>
                    <span className="text-muted"> · {activity.subjectName || 'Record'}</span>
                  </p>
                  <p className="text-sm text-muted">{activity.description}</p>
                  <p className="text-xs text-muted">{relativeTime(activity.date)} · {fullDate(activity.date)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState compact scene="activity" title="No activity recorded" description="Log a call or note and it will show up here." />
          )}
        </section>
      </div>
      <ActivityDialog
        open={Boolean(logFor)}
        onOpenChange={(open) => !open && setLogFor(null)}
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
