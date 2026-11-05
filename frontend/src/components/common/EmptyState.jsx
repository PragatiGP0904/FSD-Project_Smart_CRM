import { scenes } from '@/components/brand/illustrations';

export function EmptyState({ icon: Icon, scene, title, description, action, compact = false }) {
  const Art = scene ? scenes[scene] : null;
  return (
    <div className="empty-rise flex flex-col items-center px-6 py-8 text-center">
      {Art ? <Art compact={compact} /> : null}
      {!Art && Icon ? (
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      ) : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const Art = scenes.recover;
  return (
    <div className="empty-rise rounded-xl border border-line bg-surface px-6 py-8 text-center">
      <Art compact />
      <p className="text-sm font-medium text-ink">{message}</p>
      {onRetry ? (
        <button type="button" className="mt-3 text-sm font-medium text-primary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
