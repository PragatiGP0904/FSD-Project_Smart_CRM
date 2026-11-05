import { NavLink } from 'react-router-dom';
import {
  CalendarClock,
  Contact,
  Kanban,
  LayoutDashboard,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Tooltip } from '@/components/ui/tooltip';
import { LogoLockup, LogoMark } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/customers', label: 'Customers', icon: Contact },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban },
  { to: '/activities', label: 'Activities', icon: MessagesSquare },
  { to: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ collapsed = false, onToggle, onNavigate, mobile = false }) {
  const overdue = useQuery({
    queryKey: ['followups', { status: 'Overdue', limit: 1 }],
    queryFn: async () => (await api.get('/followups', { params: { status: 'Overdue', limit: 1 } })).data.count,
    refetchInterval: 60000,
  });

  return (
    <div className={cn('flex h-full flex-col bg-surface', mobile ? 'w-full' : collapsed ? 'w-16' : 'w-60')}>
      <div className={cn('flex h-14 items-center border-b border-line px-3', collapsed && !mobile ? 'justify-center' : 'gap-2')}>
        {collapsed && !mobile ? <LogoMark size={28} /> : <LogoLockup mark={28} />}
      </div>
      <nav aria-label="Primary" className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted transition-colors duration-200',
                  collapsed && !mobile && 'justify-center px-0',
                  isActive && 'bg-primary-soft font-medium text-primary'
                )
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {collapsed && !mobile ? null : <span className="flex-1">{item.label}</span>}
              {item.to === '/follow-ups' && overdue.data > 0 && !(collapsed && !mobile) ? (
                <span className="tabular rounded-full bg-primary-soft px-1.5 text-xs text-primary">{overdue.data}</span>
              ) : null}
            </NavLink>
          );
          if (collapsed && !mobile) {
            return (
              <Tooltip key={item.to} label={item.label}>
                {link}
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>
      {mobile ? null : (
        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm text-muted hover:bg-background"
          >
            {collapsed ? <PanelLeftOpen size={20} strokeWidth={1.75} /> : <PanelLeftClose size={20} strokeWidth={1.75} />}
            {collapsed ? null : <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );
}
