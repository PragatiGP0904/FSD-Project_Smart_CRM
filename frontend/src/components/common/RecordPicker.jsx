import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/useUi';

export function RecordPicker({ value, onChange, label = 'Linked record' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);

  const leads = useQuery({
    queryKey: ['picker-leads', debounced],
    queryFn: async () => (await api.get('/leads', { params: { search: debounced, limit: 6 } })).data.data,
    enabled: open,
  });
  const customers = useQuery({
    queryKey: ['picker-customers', debounced],
    queryFn: async () => (await api.get('/customers', { params: { search: debounced, limit: 6 } })).data.data,
    enabled: open,
  });

  useEffect(() => {
    if (value?.label) setSearch(value.label);
  }, [value?.label]);

  const choose = (next) => {
    onChange(next);
    setSearch(next.label);
    setOpen(false);
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex h-9 w-full items-center rounded-lg border border-line bg-surface px-3 text-left text-sm">
            <span className={value ? 'text-ink' : 'text-muted'}>{value?.label || 'Search a lead or customer'}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
          <Input
            autoFocus
            aria-label="Search leads and customers"
            placeholder="Search by name or company"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mt-2 max-h-64 overflow-y-auto">
            <p className="px-2 py-1 text-xs text-muted">Leads</p>
            {(leads.data || []).map((lead) => (
              <button
                key={lead._id}
                type="button"
                className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-background"
                onClick={() => choose({ kind: 'lead', id: lead._id, label: `${lead.name}${lead.company ? ` · ${lead.company}` : ''}` })}
              >
                {lead.name}
                <span className="ml-2 text-muted">{lead.company}</span>
              </button>
            ))}
            {!leads.data?.length ? <p className="px-2 py-2 text-sm text-muted">No matching leads</p> : null}
            <p className="px-2 py-1 text-xs text-muted">Customers</p>
            {(customers.data || []).map((customer) => (
              <button
                key={customer._id}
                type="button"
                className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-background"
                onClick={() => choose({ kind: 'customer', id: customer._id, label: `${customer.name}${customer.company ? ` · ${customer.company}` : ''}` })}
              >
                {customer.name}
                <span className="ml-2 text-muted">{customer.company}</span>
              </button>
            ))}
            {!customers.data?.length ? <p className="px-2 py-2 text-sm text-muted">No matching customers</p> : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
