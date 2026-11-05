import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import api, { fetchAll, getErrorMessage } from '@/services/api';
import { invalidateWorkspace } from '@/hooks/useCrm';
import { ALLOWED_TRANSITIONS, STAGES } from '@/lib/constants';
import { currency, daysInStage } from '@/lib/format';
import { useDocumentMeta } from '@/context/PageMetaContext';
import { StageChip } from '@/components/common/StageChip';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ActivityDialog } from '@/components/common/RecordDialogs';
import { TableSkeleton } from '@/components/ui/skeleton';

function LeadCard({ lead, overlay = false }) {
  const sortable = useSortable({ id: lead._id, data: { stage: lead.stage }, disabled: overlay });
  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? 0.45 : 1 };
  return (
    <article
      ref={overlay ? undefined : sortable.setNodeRef}
      style={style}
      className="rounded-2xl border border-line bg-surface p-3 shadow-none transition-shadow duration-200 hover:shadow-overlay"
      {...(overlay ? {} : sortable.attributes)}
      {...(overlay ? {} : sortable.listeners)}
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={lead.name} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{lead.name}</p>
          <p className="truncate text-xs text-muted">{lead.company || 'No company'}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">{lead.source} · {daysInStage(lead.stageUpdatedAt)}</p>
    </article>
  );
}

function Column({ stage, leads, value }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column::${stage}` });
  return (
    <section className="w-[260px] shrink-0 snap-center">
      <header className="mb-2 flex items-center justify-between gap-2 px-1">
        <StageChip stage={stage} />
        <span className="text-xs text-muted tabular">{leads.length} · {currency(value)}</span>
      </header>
      <div ref={setNodeRef} className={`min-h-48 space-y-2 rounded-xl p-1 ${isOver ? 'bg-primary-soft' : 'bg-background'}`}>
        <SortableContext items={leads.map((lead) => lead._id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => <LeadCard key={lead._id} lead={lead} />)}
        </SortableContext>
        {!leads.length ? <p className="px-2 py-6 text-center text-xs text-muted">No leads</p> : null}
      </div>
    </section>
  );
}

export default function Pipeline() {
  useDocumentMeta('Pipeline', [{ label: 'Pipeline' }]);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [pending, setPending] = useState(null);
  const [wonOpen, setWonOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const query = useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const [leads, opportunities] = await Promise.all([
        fetchAll('/leads'),
        fetchAll('/opportunities'),
      ]);
      return { leads, opportunities };
    },
  });

  const leads = query.data?.leads || [];
  const valueFor = (stage) => {
    const ids = new Set(leads.filter((lead) => lead.stage === stage).map((lead) => lead._id));
    return (query.data?.opportunities || [])
      .filter((item) => ids.has(item.leadId))
      .reduce((sum, item) => sum + (item.value || 0), 0);
  };

  const commit = async (lead, stage) => {
    const previous = queryClient.getQueryData(['pipeline']);
    queryClient.setQueryData(['pipeline'], (current) => ({
      ...current,
      leads: current.leads.map((item) => (item._id === lead._id ? { ...item, stage, stageUpdatedAt: new Date().toISOString() } : item)),
    }));
    try {
      await api.put(`/leads/${lead._id}`, { stage });
      toast.success(stage === 'Won' ? 'Customer created' : 'Stage updated');
      invalidateWorkspace(queryClient);
    } catch (error) {
      queryClient.setQueryData(['pipeline'], previous);
      toast.error(getErrorMessage(error));
    }
  };

  const onDragEnd = (event) => {
    setActiveId(null);
    if (!event.over) return;
    const lead = leads.find((item) => item._id === event.active.id);
    const overId = String(event.over.id);
    const stage = overId.startsWith('column::') ? overId.slice('column::'.length) : leads.find((item) => item._id === event.over.id)?.stage;
    if (!lead || !stage || stage === lead.stage) return;
    if (!ALLOWED_TRANSITIONS[lead.stage]?.includes(stage)) {
      toast.error(`Cannot move a lead from ${lead.stage} to ${stage}`);
      return;
    }
    if (stage === 'Contacted' && !lead.lastActivity) {
      setPending({ lead, stage });
      setActivityOpen(true);
      return;
    }
    if (stage === 'Won') {
      setPending({ lead, stage });
      setWonOpen(true);
      return;
    }
    commit(lead, stage);
  };

  const active = leads.find((lead) => lead._id === activeId);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold tracking-heading">Pipeline</h1>
        <p className="mt-1 text-sm text-muted">Drag a lead into the next stage. Illegal moves stay where they are.</p>
      </div>
      {query.isLoading ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState message="The pipeline could not be loaded." onRetry={() => query.refetch()} /> : null}
      {query.data && !leads.length ? <div className="rounded-xl border border-line bg-surface"><EmptyState scene="pipeline" title="No leads on the board" description="Add a lead and it will start in New Lead." /></div> : null}
      {leads.length ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(event) => setActiveId(event.active.id)} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
            {STAGES.map((stage) => (
              <Column key={stage} stage={stage} value={valueFor(stage)} leads={leads.filter((lead) => lead.stage === stage)} />
            ))}
          </div>
          <DragOverlay>{active ? <LeadCard lead={active} overlay /> : null}</DragOverlay>
        </DndContext>
      ) : null}
      <ActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        preset={pending ? { type: 'Call', record: { kind: 'lead', id: pending.lead._id, label: pending.lead.name } } : null}
        onSaved={() => {
          if (pending?.stage === 'Contacted') commit({ ...pending.lead, lastActivity: { type: 'Call' } }, 'Contacted');
          setPending(null);
        }}
      />
      <ConfirmDialog
        open={wonOpen}
        onOpenChange={setWonOpen}
        title={pending ? `Create a customer record for ${pending.lead.name}?` : 'Create customer'}
        description="The lead will be marked Won and a customer will be created from these contact details."
        confirmLabel="Create customer"
        tone="primary"
        onConfirm={() => {
          if (pending) commit(pending.lead, 'Won');
          setWonOpen(false);
          setPending(null);
        }}
      />
    </div>
  );
}
