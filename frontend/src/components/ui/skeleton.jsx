export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-line ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
      <Skeleton className="mt-3 h-3 w-28" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex h-10 items-center gap-4 border-b border-line px-4 last:border-b-0">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="hidden h-3 w-20 md:block" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
