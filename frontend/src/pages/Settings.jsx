import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { fetchAll, getErrorMessage } from '@/services/api';
import { invalidateWorkspace } from '@/hooks/useCrm';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { downloadCsv } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { PasswordField } from '@/pages/Login';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function Settings() {
  useDocumentMeta('Settings', [{ label: 'Settings' }]);
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const saveName = useMutation({
    mutationFn: async () => (await api.put('/auth/me', { name: name.trim() })).data.data,
    onSuccess: (next) => {
      setUser(next);
      toast.success('Name saved');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const savePassword = useMutation({
    mutationFn: async () => (await api.put('/auth/me', { currentPassword, password })).data,
    onSuccess: () => {
      setCurrentPassword('');
      setPassword('');
      toast.success('Password updated');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const wipe = useMutation({
    mutationFn: async () => (await api.delete('/auth/data')).data,
    onSuccess: () => {
      toast.success('Data deleted');
      setConfirmOpen(false);
      invalidateWorkspace(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const exportLeads = async () => {
    const rows = await fetchAll('/leads');
    downloadCsv('smart-crm-leads.csv', [
      { label: 'Name', value: (row) => row.name },
      { label: 'Email', value: (row) => row.email },
      { label: 'Phone', value: (row) => row.phone },
      { label: 'Company', value: (row) => row.company },
      { label: 'Source', value: (row) => row.source },
      { label: 'Stage', value: (row) => row.stage },
      { label: 'Notes', value: (row) => row.notes },
    ], rows);
    toast.success('Leads exported');
  };

  const exportCustomers = async () => {
    const rows = await fetchAll('/customers');
    downloadCsv('smart-crm-customers.csv', [
      { label: 'Name', value: (row) => row.name },
      { label: 'Email', value: (row) => row.email },
      { label: 'Phone', value: (row) => row.phone },
      { label: 'Company', value: (row) => row.company },
      { label: 'Status', value: (row) => row.status },
    ], rows);
    toast.success('Customers exported');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-heading">Settings</h1>
        <p className="mt-1 text-sm text-muted">Profile, appearance, and the records on this account.</p>
      </div>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); saveName.mutate(); }}>
          <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field>
          <Field label="Email"><Input value={user?.email || ''} disabled /></Field>
          <Button type="submit" disabled={saveName.isPending || name.trim().length < 2}>Save name</Button>
        </form>
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Password</h2>
        <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); savePassword.mutate(); }}>
          <PasswordField id="current-password" label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <PasswordField id="new-password" label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button type="submit" disabled={savePassword.isPending || password.length < 6 || !currentPassword}>Update password</Button>
        </form>
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Theme</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Theme">
          {['light', 'dark', 'system'].map((option) => (
            <button key={option} type="button" role="radio" aria-checked={theme === option} className={`h-9 rounded-lg border px-3 text-sm capitalize ${theme === option ? 'border-primary bg-primary-soft text-primary' : 'border-line'}`} onClick={() => setTheme(option)}>
              {option}
            </button>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Export</h2>
        <p className="mt-1 text-sm text-muted">Download the leads or customers on this account as CSV.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportLeads}>Export leads</Button>
          <Button variant="secondary" onClick={exportCustomers}>Export customers</Button>
        </div>
      </section>
      <section className="rounded-xl border border-danger/40 bg-surface p-4">
        <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
        <p className="mt-1 text-sm text-muted">Delete every lead, customer, opportunity, activity, and follow-up on this account. The login stays.</p>
        <Button className="mt-3" variant="danger" onClick={() => setConfirmOpen(true)}>Delete all data</Button>
      </section>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete all CRM data for ${user?.name}?`}
        description="This removes your records from the database. Your account remains."
        confirmLabel="Delete data"
        loading={wipe.isPending}
        onConfirm={() => wipe.mutate()}
      />
    </div>
  );
}
