import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/services/api';
import { invalidateWorkspace } from '@/hooks/useCrm';
import { useCompleteFollowUp } from '@/hooks/useCrm';
import { useDebounce, useStoredState } from '@/hooks/useUi';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { SOURCES, STAGES } from '@/lib/constants';
import { fullDate, relativeTime } from '@/lib/format';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Pagination } from '@/components/common/DataTable';
import { Avatar } from '@/components/common/Avatar';
import { StageChip } from '@/components/common/StageChip';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { ActivityDialog, FollowUpDialog, LeadFormDialog } from '@/components/common/RecordDialogs';

export default function Leads() {
  useDocumentMeta('Leads', [{ label: 'Leads' }]);
  const queryClient = useQueryClient();
  const complete = useCompleteFollowUp();
  const [filters, setFilters] = useStoredState('smartcrm_lead_filters', {
    search: '', stage: '', source: '', page: 1, limit: 10, sort: '-createdAt',
  });
  const debounced = useDebounce(filters.search, 300);
  const [selected, setSelected] = useState(() => new Set());
  const [activeId, setActiveId] = useState(null);
  const [leadForm, setLeadForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activityFor, setActivityFor] = useState(null);
  const [followFor, setFollowFor] = useState(null);

  const query = useQuery({
    queryKey: ['leads', { ...filters, search: debounced }],
    queryFn: async () => (await api.get('/leads', {
      params: {
        search: debounced || undefined,
        stage: filters.stage || undefined,
        source: filters.source || undefined,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
      },
    })).data,
  });

  const remove = useMutation({
    mutationFn: async (ids) => Promise.all(ids.map((id) => api.delete(`/leads/${id}`))),
    onSuccess: () => {
      toast.success(selected.size > 1 ? 'Leads deleted' : 'Lead deleted');
      setSelected(new Set());
      setConfirmDelete(false);
      setActiveId(null);
      invalidateWorkspace(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const columns = useMemo(() => [
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
    { key: 'source', label: 'Source', render: (row) => row.source },
    { key: 'stage', label: 'Stage', render: (row) => <StageChip stage={row.stage} /> },
    {
      key: 'activity',
      label: 'Last activity',
      render: (row) => row.lastActivity ? `${row.lastActivity.type}, ${relativeTime(row.lastActivity.date)}` : 'None yet',
    },
    { key: 'created', label: 'Created', render: (row) => <span className="tabular">{fullDate(row.createdAt)}</span> },
  ], []);

  const rows = query.data?.data || [];
  const names = rows.filter((row) => selected.has(row._id)).map((row) => row.name);

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track who you might work with, and what stage the conversation has reached."
        actions={<Button onClick={() => setLeadForm(true)}>New lead</Button>}
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          className="w-full sm:w-64"
          aria-label="Search leads"
          placeholder="Search name, company, or email"
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
        />
        <Select aria-label="Filter by stage" value={filters.stage} onChange={(event) => setFilters({ ...filters, stage: event.target.value, page: 1 })}>
          <option value="">All stages</option>
          {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
        </Select>
        <Select aria-label="Filter by source" value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value, page: 1 })}>
          <option value="">All sources</option>
          {SOURCES.map((source) => <option key={source}>{source}</option>)}
        </Select>
        <Select aria-label="Sort leads" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="name">Name</option>
          <option value="company">Company</option>
        </Select>
        {selected.size ? (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete selected</Button>
        ) : null}
      </div>
      {query.isLoading ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState message="Leads could not be loaded." onRetry={() => query.refetch()} /> : null}
      {query.data ? (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            selected={selected}
            onRowClick={(row) => setActiveId(row._id)}
            onToggle={(id) => {
              const next = new Set(selected);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              setSelected(next);
            }}
            onToggleAll={(pageRows) => {
              const next = new Set(selected);
              const allOn = pageRows.every((row) => next.has(row._id));
              pageRows.forEach((row) => (allOn ? next.delete(row._id) : next.add(row._id)));
              setSelected(next);
            }}
            empty={filters.search || filters.stage || filters.source
              ? <div className="rounded-xl border border-line bg-surface"><EmptyState scene="search" title="No leads match" description="Try another name, company, stage, or source." /></div>
              : <div className="rounded-xl border border-line bg-surface"><EmptyState scene="leads" title="No leads yet" description="Add your first lead." action={<Button onClick={() => setLeadForm(true)}>New lead</Button>} /></div>}
          />
          <Pagination
            page={query.data.page}
            pages={query.data.pages}
            count={query.data.count}
            limit={filters.limit}
            onPage={(page) => setFilters({ ...filters, page })}
            onLimit={(limit) => setFilters({ ...filters, limit, page: 1 })}
          />
        </>
      ) : null}
      <LeadDrawer
        leadId={activeId}
        open={Boolean(activeId)}
        onOpenChange={(open) => !open && setActiveId(null)}
        onLog={(lead) => setActivityFor({ kind: 'lead', id: lead._id, label: lead.name })}
        onFollowUp={(lead) => setFollowFor({ kind: 'lead', id: lead._id, label: lead.name })}
        onComplete={(item) => complete.mutate(item._id)}
      />
      <LeadFormDialog open={leadForm} onOpenChange={setLeadForm} />
      <ActivityDialog open={Boolean(activityFor)} onOpenChange={(open) => !open && setActivityFor(null)} preset={{ type: 'Call', record: activityFor }} />
      <FollowUpDialog open={Boolean(followFor)} onOpenChange={(open) => !open && setFollowFor(null)} preset={{ record: followFor }} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={selected.size === 1 ? `Delete ${names[0] || 'this lead'}?` : `Delete ${selected.size} leads?`}
        description="Their activities, follow-ups, and opportunities are removed. A customer created from a won lead stays."
        confirmLabel="Delete lead"
        loading={remove.isPending}
        onConfirm={() => remove.mutate([...selected])}
      />
    </div>
  );
}
