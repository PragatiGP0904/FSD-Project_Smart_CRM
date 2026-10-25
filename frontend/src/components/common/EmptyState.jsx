export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon ? (
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
  return (
    <div className="rounded-xl border border-line bg-surface px-6 py-8">
      <p className="text-sm font-medium text-ink">{message}</p>
      {onRetry ? (
        <button type="button" className="mt-3 text-sm font-medium text-primary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
