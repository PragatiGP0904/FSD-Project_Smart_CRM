import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, Moon, Search, Sun, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { Sheet } from '@/components/ui/dialog';
import { Menu as UserMenu, MenuItem } from '@/components/ui/menu';
import { useAuth } from '@/context/AuthContext';
import { usePageMeta } from '@/context/PageMetaContext';
import { useTheme } from '@/context/ThemeContext';
import { LeadFormDialog, FollowUpDialog } from '@/components/common/RecordDialogs';

export function AppShell() {
  const { user, logout } = useAuth();
  const { setTheme, resolved } = useTheme();
  const { meta } = usePageMeta();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('smartcrm_sidebar') === 'collapsed');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartcrm_sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-background text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="fixed inset-y-0 left-0 z-30 hidden border-r border-line md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} title="Smart CRM" className="md:hidden">
        <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
      </Sheet>
      <div className={collapsed ? 'md:pl-16' : 'md:pl-60'}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 md:px-6">
          <button type="button" className="rounded-lg p-2 text-ink md:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu size={20} strokeWidth={1.75} />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 truncate text-sm text-muted">
              {meta.crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-2 truncate">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {crumb.to ? <Link className="hover:text-ink" to={crumb.to}>{crumb.label}</Link> : <span className="truncate text-ink">{crumb.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm text-muted sm:inline-flex"
          >
            <Search size={16} strokeWidth={1.75} />
            Search
            <kbd className="rounded border border-line px-1 text-xs">Ctrl K</kbd>
          </button>
          <button type="button" className="rounded-lg p-2 sm:hidden" aria-label="Open command menu" onClick={() => setPaletteOpen(true)}>
            <Search size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="rounded-lg p-2"
          >
            {resolved === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
          </button>
          <UserMenu
            trigger={
              <button type="button" className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm" aria-label="Account menu">
                <span className="max-w-32 truncate font-medium">{user?.name}</span>
              </button>
            }
          >
            <div className="px-2 py-2 text-xs text-muted">{user?.email}</div>
            <MenuItem onSelect={() => (window.location.href = '/settings')}>Settings</MenuItem>
            <MenuItem
              onSelect={() => {
                logout();
                queryClient.clear();
                window.location.href = '/login';
              }}
            >
              <LogOut size={16} strokeWidth={1.75} /> Sign out
            </MenuItem>
          </UserMenu>
        </header>
        <main id="main" className="mx-auto w-full max-w-page px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNewLead={() => setLeadOpen(true)} onNewFollowUp={() => setFollowOpen(true)} />
      <LeadFormDialog open={leadOpen} onOpenChange={setLeadOpen} />
      <FollowUpDialog open={followOpen} onOpenChange={setFollowOpen} />
    </div>
  );
}
