import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { EmptyState } from '@/components/common/EmptyState';

export function LeadsOverTimeChart({ points }) {
  const data = (points || []).map((point) => ({
    label: format(new Date(point.weekStart), 'd MMM'),
    count: point.count,
  }));
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (!total) {
    return <EmptyState title="No leads in the last 8 weeks" description="New leads will appear here week by week." />;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <XAxis dataKey="label" stroke="var(--ink-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} stroke="var(--ink-muted)" fontSize={12} width={28} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
          <Area type="monotone" dataKey="count" stroke="var(--primary)" fill="var(--primary-soft)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
