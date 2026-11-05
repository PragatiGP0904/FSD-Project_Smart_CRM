import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/common/Avatar';
import { PriorityChip, StageChip } from '@/components/common/StageChip';
import { dueLabel, splitInteraction } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ContextFollowUpCard({ item, onComplete, onLog, completing = false, staticPreview = false }) {
  const interaction = splitInteraction(item.context?.lastInteraction, item.context?.lastInteractionAt);
  const overdue = item.status === 'Overdue';
  const completed = item.status === 'Completed';
  const name = item.context?.name || 'Follow-up';

  return (
    <article
      className={cn(
        'rounded-2xl border border-line bg-surface p-4 transition-shadow duration-200',
        !staticPreview && 'hover:shadow-overlay',
        completed && 'opacity-75'
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-md font-semibold tracking-heading text-ink">{name}</h3>
            <span className={cn('shrink-0 text-xs tabular', overdue ? 'text-[var(--danger)]' : 'text-muted')}>
              {dueLabel(item.dueDate, item.status)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StageChip stage={item.context?.stage || 'New Lead'} />
            <PriorityChip priority={item.priority} />
            <span className="text-xs text-muted">{interaction.summary}</span>
          </div>
        </div>
      </div>

      {interaction.quote ? (
        <blockquote className="mt-4 rounded-xl bg-background px-3 py-3 text-[15px] leading-6 text-ink">
          “{interaction.quote}”
        </blockquote>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-medium text-muted">Next action</p>
        <p className="mt-1 text-sm font-medium text-ink">{item.title}</p>
      </div>

      {!staticPreview && !completed ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => onLog?.(item)}>Log call</Button>
          <Button onClick={() => onComplete?.(item)} disabled={completing}>
            {completing ? 'Saving' : 'Mark completed'}
          </Button>
        </div>
      ) : null}
      {completed ? <p className="mt-4 text-sm text-success">Completed</p> : null}
    </article>
  );
}
