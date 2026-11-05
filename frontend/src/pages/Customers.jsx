import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useDebounce, useStoredState } from '@/hooks/useUi';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { CUSTOMER_STATUSES } from '@/lib/constants';
import { fullDate } from '@/lib/format';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Pagination } from '@/components/common/DataTable';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { CustomerFormDialog } from '@/components/common/RecordDialogs';

export default function Customers() {
  useDocumentMeta('Customers', [{ label: 'Customers' }]);
  const navigate = useNavigate();
  const [filters, setFilters] = useStoredState('smartcrm_customer_filters', {
    search: '', status: '', page: 1, limit: 10, sort: '-createdAt',
  });
  const debounced = useDebounce(filters.search, 300);
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ['customers', { ...filters, search: debounced }],
    queryFn: async () => (await api.get('/customers', {
      params: {
        search: debounced || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      },
    })).data,
  });

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <Avatar name={row.name} />
          <span className="font-medium">{row.name}</span>
        </span>
      ),
    },
    { key: 'company', label: 'Company', render: (row) => row.company || '—' },
    { key: 'status', label: 'Status', render: (row) => row.status },
    { key: 'email', label: 'Email', render: (row) => row.email || row.phone || '—' },
    { key: 'created', label: 'Created', render: (row) => fullDate(row.createdAt) },
  ];

  return (
    <div>
      <PageHeader title="Customers" description="People and companies you already work with." actions={<Button onClick={() => setOpen(true)}>New customer</Button>} />
      <div className="mb-3 flex flex-wrap gap-2">
        <Input className="w-full sm:w-64" aria-label="Search customers" placeholder="Search name, company, or email" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })} />
        <Select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {CUSTOMER_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </Select>
      </div>
      {query.isLoading ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState message="Customers could not be loaded." onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <>
          <DataTable
            columns={columns}
            rows={query.data.data}
            onRowClick={(row) => navigate(`/customers/${row._id}`)}
            empty={filters.search || filters.status
              ? <div className="rounded-xl border border-line bg-surface"><EmptyState scene="search" title="No customers match" description="Try another name, company, or status." /></div>
              : <div className="rounded-xl border border-line bg-surface"><EmptyState scene="customers" title="No customers yet" description="Won leads become customers, or you can add one directly." action={<Button onClick={() => setOpen(true)}>New customer</Button>} /></div>}
          />
          <Pagination page={query.data.page} pages={query.data.pages} count={query.data.count} limit={filters.limit} onPage={(page) => setFilters({ ...filters, page })} onLimit={(limit) => setFilters({ ...filters, limit, page: 1 })} />
        </>
      ) : null}
      <CustomerFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
