import { STAGE_VAR } from '@/lib/constants';

function tint(stage) {
  const color = STAGE_VAR[stage] || 'var(--ink-muted)';
  return {
    color,
    background: `color-mix(in srgb, ${color} 14%, transparent)`,
  };
}

export function StageChip({ stage }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={tint(stage)}>
      {stage}
    </span>
  );
}

const priorityColor = {
  High: 'var(--ink)',
  Medium: 'var(--ink-muted)',
  Low: 'var(--ink-muted)',
};

export function PriorityChip({ priority }) {
  return (
    <span className="text-xs font-medium" style={{ color: priorityColor[priority] || 'var(--ink-muted)' }}>
      {priority}
    </span>
  );
}
