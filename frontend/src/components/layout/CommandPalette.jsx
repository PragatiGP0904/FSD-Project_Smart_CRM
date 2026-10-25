import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Command } from 'cmdk';
import { CalendarClock, Contact, Kanban, LayoutDashboard, MessagesSquare, Plus, Settings, Users } from 'lucide-react';
import api from '@/services/api';
import { useDebounce } from '@/hooks/useUi';

const pages = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/customers', label: 'Customers', icon: Contact },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/activities', label: 'Activities', icon: MessagesSquare },
  { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function CommandPalette({ open, onOpenChange, onNewLead, onNewFollowUp }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 200);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const leads = useQuery({
    queryKey: ['palette-leads', debounced],
    enabled: open && debounced.trim().length > 1,
    queryFn: async () => (await api.get('/leads', { params: { search: debounced, limit: 5 } })).data.data,
  });
  const customers = useQuery({
    queryKey: ['palette-customers', debounced],
    enabled: open && debounced.trim().length > 1,
    queryFn: async () => (await api.get('/customers', { params: { search: debounced, limit: 5 } })).data.data,
  });

  const go = (to) => {
    navigate(to);
    onOpenChange(false);
  };

  if (!open) return null;

  const query = debounced.trim().toLowerCase();
  const visiblePages = query ? pages.filter((page) => page.label.toLowerCase().includes(query)) : pages;
  const searching = debounced.trim().length > 1;
  const pending = searching && (leads.isFetching || customers.isFetching);
  const hasRecords = Boolean(leads.data?.length || customers.data?.length || visiblePages.length);
  const itemClass = 'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink aria-selected:bg-background';

  return (
    <div className="fixed inset-0 z-50 bg-[#101828]/40" onMouseDown={() => onOpenChange(false)}>
      <div
        className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-overlay"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Command label="Command menu" shouldFilter={false} className="text-sm">
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Search leads, customers, and pages"
            className="h-11 w-full border-b border-line bg-transparent px-4 text-sm outline-none"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {!pending && !hasRecords ? (
              <Command.Empty className="px-2 py-6 text-center text-sm text-muted">No matching records.</Command.Empty>
            ) : null}
            {!query ? (
              <Command.Group heading="Actions" className="px-2 py-1 text-xs text-muted">
                <Command.Item value="new-lead" className={itemClass} onSelect={() => { onNewLead(); onOpenChange(false); }}>
                  <Plus size={16} strokeWidth={1.75} /> New lead
                </Command.Item>
                <Command.Item value="new-follow-up" className={itemClass} onSelect={() => { onNewFollowUp(); onOpenChange(false); }}>
                  <Plus size={16} strokeWidth={1.75} /> New follow-up
                </Command.Item>
              </Command.Group>
            ) : null}
            {visiblePages.length ? (
              <Command.Group heading="Pages" className="px-2 py-1 text-xs text-muted">
                {visiblePages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Command.Item key={page.to} value={page.label} className={itemClass} onSelect={() => go(page.to)}>
                      <Icon size={16} strokeWidth={1.75} /> {page.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ) : null}
            {leads.data?.length ? (
              <Command.Group heading="Leads" className="px-2 py-1 text-xs text-muted">
                {leads.data.map((lead) => (
                  <Command.Item key={lead._id} value={`${lead.name} ${lead.company || ''}`} className={itemClass} onSelect={() => go(`/leads/${lead._id}`)}>
                    {lead.name}
                    <span className="text-muted">{lead.company}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
            {customers.data?.length ? (
              <Command.Group heading="Customers" className="px-2 py-1 text-xs text-muted">
                {customers.data.map((customer) => (
                  <Command.Item key={customer._id} value={`${customer.name} ${customer.company || ''}`} className={itemClass} onSelect={() => go(`/customers/${customer._id}`)}>
                    {customer.name}
                    <span className="text-muted">{customer.company}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
            {pending ? <p className="px-2 py-3 text-center text-sm text-muted">Searching…</p> : null}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
