import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/services/api';
import { invalidateWorkspace } from '@/hooks/useCrm';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { RecordPicker } from '@/components/common/RecordPicker';
import { ACTIVITY_TYPES, CUSTOMER_STATUSES, PRIORITIES, SOURCES, STAGES } from '@/lib/constants';
import { toDateTimeLocal } from '@/lib/format';

function useSave(path, method, id, success) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const response = method === 'put' ? await api.put(`${path}/${id}`, body) : await api.post(path, body);
      return response.data;
    },
    onSuccess: () => {
      toast.success(success);
      invalidateWorkspace(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function LeadFormDialog({ open, onOpenChange, lead }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'Website', notes: '' });
  const [error, setError] = useState('');
  const save = useSave('/leads', lead ? 'put' : 'post', lead?._id, lead ? 'Lead saved' : 'Lead saved');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      company: lead?.company || '',
      source: lead?.source || 'Website',
      notes: lead?.notes || '',
    });
  }, [open, lead]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError('Add a name and at least one contact detail.');
      return;
    }
    try {
      await save.mutateAsync(form);
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={lead ? 'Edit lead' : 'New lead'} description="A lead starts in New Lead until you record an interaction.">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company"><Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></Field>
          <Field label="Source">
            <Select className="w-full" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}>
              {SOURCES.map((source) => <option key={source}>{source}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Notes"><Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving' : 'Save lead'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function CustomerFormDialog({ open, onOpenChange, customer }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'Active' });
  const [error, setError] = useState('');
  const save = useSave('/customers', customer ? 'put' : 'post', customer?._id, 'Customer saved');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      company: customer?.company || '',
      status: customer?.status || 'Active',
    });
  }, [open, customer]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError('Add a name and at least one contact detail.');
      return;
    }
    try {
      await save.mutateAsync(form);
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={customer ? 'Edit customer' : 'New customer'}>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Name"><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email"><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company"><Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></Field>
          <Field label="Status">
            <Select className="w-full" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {CUSTOMER_STATUSES.map((status) => <option key={status}>{status}</option>)}
            </Select>
          </Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>Save customer</Button>
        </div>
      </form>
    </Modal>
  );
}

export function ActivityDialog({ open, onOpenChange, preset, onSaved }) {
  const [type, setType] = useState('Call');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(toDateTimeLocal());
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const save = useSave('/activities', 'post', null, 'Activity recorded');

  useEffect(() => {
    if (!open) return;
    setType(preset?.type || 'Call');
    setDescription('');
    setDate(toDateTimeLocal());
    setRecord(preset?.record || null);
    setError('');
  }, [open, preset]);

  const submit = async (event) => {
    event.preventDefault();
    if (!record) {
      setError('Choose the lead or customer this interaction belongs to.');
      return;
    }
    if (description.trim().length < 2) {
      setError('Describe what was said.');
      return;
    }
    try {
      await save.mutateAsync({
        type,
        description: description.trim(),
        date: new Date(date).toISOString(),
        leadId: record.kind === 'lead' ? record.id : undefined,
        customerId: record.kind === 'customer' ? record.id : undefined,
      });
      onSaved?.();
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log activity" description="Calls, meetings, emails and notes stay on the lead or customer.">
      <form className="space-y-3" onSubmit={submit}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Activity type">
          {ACTIVITY_TYPES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={type === item}
              className={`h-9 rounded-lg border px-3 text-sm ${type === item ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink'}`}
              onClick={() => setType(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <RecordPicker value={record} onChange={setRecord} />
        <Field label="What happened"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
        <Field label="When"><Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>Save activity</Button>
        </div>
      </form>
    </Modal>
  );
}

export function FollowUpDialog({ open, onOpenChange, preset }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState(toDateTimeLocal());
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const save = useSave('/followups', 'post', null, 'Follow-up scheduled');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setPriority('High');
    setDueDate(toDateTimeLocal());
    setRecord(preset?.record || null);
    setError('');
  }, [open, preset]);

  const submit = async (event) => {
    event.preventDefault();
    if (!record || title.trim().length < 2) {
      setError('Add the next action and choose a lead or customer.');
      return;
    }
    try {
      await save.mutateAsync({
        title: title.trim(),
        priority,
        dueDate: new Date(dueDate).toISOString(),
        leadId: record.kind === 'lead' ? record.id : undefined,
        customerId: record.kind === 'customer' ? record.id : undefined,
      });
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New follow-up"
      description="The stage and latest interaction are stored with the follow-up."
    >
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Next action"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
        <RecordPicker value={record} onChange={setRecord} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Priority">
            <Select className="w-full" value={priority} onChange={(event) => setPriority(event.target.value)}>
              {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Due"><Input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>Schedule follow-up</Button>
        </div>
      </form>
    </Modal>
  );
}

export function OpportunityDialog({ open, onOpenChange, preset }) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('New Lead');
  const [probability, setProbability] = useState(10);
  const [closeDate, setCloseDate] = useState('');
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const save = useSave('/opportunities', 'post', null, 'Opportunity saved');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setValue('');
    setStage('New Lead');
    setProbability(10);
    setCloseDate('');
    setRecord(preset?.record || null);
    setError('');
  }, [open, preset]);

  const submit = async (event) => {
    event.preventDefault();
    if (!record || title.trim().length < 2 || value === '') {
      setError('Add a title, a value, and a lead or customer.');
      return;
    }
    try {
      await save.mutateAsync({
        title: title.trim(),
        value: Number(value),
        stage,
        probability: Number(probability),
        expectedCloseDate: closeDate ? new Date(closeDate).toISOString() : undefined,
        leadId: record.kind === 'lead' ? record.id : undefined,
        customerId: record.kind === 'customer' ? record.id : undefined,
      });
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New opportunity">
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
        <RecordPicker value={record} onChange={setRecord} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Value (INR)"><Input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} /></Field>
          <Field label="Probability">
            <Input type="number" min="0" max="100" value={probability} onChange={(event) => setProbability(event.target.value)} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Stage">
            <Select className="w-full" value={stage} onChange={(event) => setStage(event.target.value)}>
              {STAGES.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </Field>
          <Field label="Expected close"><Input type="date" value={closeDate} onChange={(event) => setCloseDate(event.target.value)} /></Field>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>Save opportunity</Button>
        </div>
      </form>
    </Modal>
  );
}
