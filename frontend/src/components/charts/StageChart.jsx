import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STAGE_VAR, STAGES } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';

export function StageChart({ distribution }) {
  const data = STAGES.map((stage) => ({ stage, count: distribution?.[stage] || 0 }));
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (!total) {
    return <EmptyState scene="chart" compact title="No leads in the pipeline yet" description="Add a lead to see how work is spread across stages." />;
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
          <XAxis type="number" allowDecimals={false} stroke="var(--ink-muted)" fontSize={12} />
          <YAxis type="category" dataKey="stage" width={88} stroke="var(--ink-muted)" fontSize={12} />
          <Tooltip
            cursor={{ fill: 'var(--primary-soft)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((entry) => (
              <Cell key={entry.stage} fill={STAGE_VAR[entry.stage]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
