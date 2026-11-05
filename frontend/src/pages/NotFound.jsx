import { Link } from 'react-router-dom';
import { scenes } from '@/components/brand/illustrations';

export default function NotFound() {
  const Art = scenes.missing;
  return (
    <div className="empty-rise flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Art />
      <h1 className="text-lg font-semibold tracking-heading">This page is not in Smart CRM</h1>
      <p className="mt-2 text-sm text-muted">The address may be mistyped, or the record may have been removed.</p>
      <Link className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-[var(--primary-ink)] transition-colors duration-200" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
