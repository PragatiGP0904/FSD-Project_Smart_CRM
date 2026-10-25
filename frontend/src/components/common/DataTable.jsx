import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';

export function DataTable({ columns, rows, onRowClick, selected, onToggle, onToggleAll, empty }) {
  if (!rows.length) return empty || null;
  const allChecked = rows.length > 0 && rows.every((row) => selected?.has(row._id));

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-10 border-b border-line text-sm text-muted">
              {onToggle ? (
                <th className="w-10 px-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allChecked}
                    onChange={() => onToggleAll(rows)}
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column.key} className="px-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? `Open ${row.name || row.title}` : undefined}
                className="h-10 border-b border-line last:border-b-0 hover:bg-background"
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (!onRowClick) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {onToggle ? (
                  <td className="px-3" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.name || row.title}`}
                      checked={selected?.has(row._id) || false}
                      onChange={() => onToggle(row._id)}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key} className="px-3 text-sm text-ink">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <button
            key={row._id}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="block w-full rounded-xl border border-line bg-surface p-3 text-left"
          >
            {columns.slice(0, 4).map((column) => (
              <div key={column.key} className="mt-1 first:mt-0 text-sm">
                {column.render(row)}
              </div>
            ))}
          </button>
        ))}
      </div>
    </>
  );
}

export function Pagination({ page, pages, count, limit, onPage, onLimit }) {
  const start = count === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, count);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <p className="tabular">
        Showing {start}–{end} of {count}
      </p>
      <div className="flex items-center gap-2">
        {onLimit ? (
          <Select aria-label="Rows per page" value={limit} onChange={(event) => onLimit(Number(event.target.value))}>
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </Select>
        ) : null}
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span className="tabular text-ink">
          {page} / {pages || 1}
        </span>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
