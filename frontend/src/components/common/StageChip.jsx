import { STAGE_VAR } from '@/lib/constants';

export function StageChip({ stage }) {
  const color = STAGE_VAR[stage] || 'var(--ink-muted)';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {stage}
    </span>
  );
}

const priorityColor = {
  High: 'var(--danger)',
  Medium: 'var(--warning)',
  Low: 'var(--ink-muted)',
};

export function PriorityChip({ priority }) {
  const color = priorityColor[priority] || 'var(--ink-muted)';
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
      {priority}
    </span>
  );
}
