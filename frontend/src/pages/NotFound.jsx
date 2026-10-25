import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-lg font-semibold tracking-heading">This page is not in Smart CRM</h1>
      <p className="mt-2 text-sm text-muted">The address may be mistyped, or the record may have been removed.</p>
      <Link className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-white" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
