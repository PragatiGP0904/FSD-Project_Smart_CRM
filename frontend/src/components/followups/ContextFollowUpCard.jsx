import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriorityChip, StageChip } from '@/components/common/StageChip';
import { dueLabel, splitInteraction } from '@/lib/format';
import { cn } from '@/lib/utils';

export function ContextFollowUpCard({ item, onComplete, onLog, completing = false, staticPreview = false }) {
  const interaction = splitInteraction(item.context?.lastInteraction, item.context?.lastInteractionAt);
  const overdue = item.status === 'Overdue';
  const completed = item.status === 'Completed';

  return (
    <article
      className={cn(
        'rounded-xl border border-line bg-surface p-4',
        overdue && 'border-l-[3px] border-l-danger',
        completed && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-md font-semibold tracking-heading text-ink">{item.context?.name || 'Follow-up'}</h3>
        <div className="flex shrink-0 items-center gap-3">
          <PriorityChip priority={item.priority} />
          <span className={cn('text-sm tabular', overdue ? 'text-danger' : 'text-muted')}>
            {dueLabel(item.dueDate, item.status)}
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          Stage
          <StageChip stage={item.context?.stage || 'New Lead'} />
        </span>
        <span>Last interaction: {interaction.summary}</span>
      </div>
      {interaction.quote ? <p className="mt-2 text-sm text-muted">“{interaction.quote}”</p> : null}
      <div className="mt-3 border-t border-line pt-3">
        <p className="text-sm text-ink">
          <span className="text-muted">Next action: </span>
          {item.title}
        </p>
        {!staticPreview && !completed ? (
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => onLog?.(item)}>
              Log call
            </Button>
            <Button onClick={() => onComplete?.(item)} disabled={completing}>
              {completed ? 'Completed' : 'Mark completed'}
            </Button>
          </div>
        ) : null}
        {completed ? (
          <p className="mt-3 inline-flex items-center gap-1 text-sm text-success">
            <Check size={16} strokeWidth={1.75} />
            Completed
          </p>
        ) : null}
      </div>
    </article>
  );
}
