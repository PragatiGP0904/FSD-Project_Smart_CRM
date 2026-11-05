import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/services/api';
import { invalidateWorkspace } from '@/hooks/useCrm';
import { ALLOWED_TRANSITIONS, STAGES } from '@/lib/constants';
import { dateTime, relativeTime } from '@/lib/format';
import { Sheet } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { StageChip } from '@/components/common/StageChip';
import { Avatar } from '@/components/common/Avatar';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { EmptyState } from '@/components/common/EmptyState';

export function LeadDrawer({ leadId, open, onOpenChange, onLog, onFollowUp, onComplete }) {
  const queryClient = useQueryClient();
  const [confirmWon, setConfirmWon] = useState(false);
  const leadQuery = useQuery({
    queryKey: ['lead', leadId],
    enabled: Boolean(leadId) && open,
    queryFn: async () => (await api.get(`/leads/${leadId}`)).data.data,
  });
  const lead = leadQuery.data;

  const move = useMutation({
    mutationFn: async (stage) => (await api.put(`/leads/${leadId}`, { stage })).data,
    onSuccess: () => {
      toast.success('Stage updated');
      invalidateWorkspace(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  useEffect(() => {
    if (!open) setConfirmWon(false);
  }, [open]);

  const requestStage = (stage) => {
    if (stage === 'Won') {
      setConfirmWon(true);
      return;
    }
    move.mutate(stage);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={lead?.name || 'Lead'}
      description={lead?.company || 'Lead details'}
      media={lead ? <Avatar name={lead.name} size={44} /> : null}
    >
      {leadQuery.isLoading ? <p className="text-sm text-muted">Loading lead</p> : null}
      {lead ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <StageChip stage={lead.stage} />
            <Link className="text-sm text-primary" to={`/leads/${lead._id}`} onClick={() => onOpenChange(false)}>
              Open full page
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">Email</dt><dd>{lead.email || 'Not added'}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd>{lead.phone || 'Not added'}</dd></div>
            <div><dt className="text-muted">Source</dt><dd>{lead.source}</dd></div>
            <div><dt className="text-muted">Added</dt><dd>{dateTime(lead.createdAt)}</dd></div>
          </dl>
          {lead.notes ? <p className="text-sm text-muted">{lead.notes}</p> : null}
          <div>
            <p className="mb-2 text-sm font-medium">Move stage</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => {
                const legal = stage === lead.stage || ALLOWED_TRANSITIONS[lead.stage].includes(stage);
                const needsActivity = stage === 'Contacted' && !(lead.activities || []).length;
                const disabled = !legal || stage === lead.stage || needsActivity || move.isPending;
                let reason = '';
                if (stage !== lead.stage && !legal) reason = `Cannot move a lead from ${lead.stage} to ${stage}`;
                if (needsActivity) reason = 'Record an interaction before marking the lead as Contacted';
                const button = (
                  <button
                    key={stage}
                    type="button"
                    disabled={disabled}
                    onClick={() => requestStage(stage)}
                    className="h-8 rounded-full border border-line px-3 text-xs disabled:opacity-40"
                  >
                    {stage}
                  </button>
                );
                return reason ? <Tooltip key={stage} label={reason}>{button}</Tooltip> : button;
              })}
            </div>
            {confirmWon ? (
              <div className="mt-3 rounded-xl border border-line p-3">
                <p className="text-sm">Create a customer record for {lead.name}? The lead will be marked Won.</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => { move.mutate('Won'); setConfirmWon(false); }}>Create customer</Button>
                  <Button variant="secondary" onClick={() => setConfirmWon(false)}>Cancel</Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onLog(lead)}>Log activity</Button>
            <Button variant="secondary" onClick={() => onFollowUp(lead)}>New follow-up</Button>
          </div>
          <section>
            <h3 className="mb-2 text-sm font-medium">Activity</h3>
            {lead.activities?.length ? (
              <ol className="space-y-3">
                {lead.activities.map((activity) => (
                  <li key={activity._id} className="border-l border-line pl-3">
                    <p className="text-sm font-medium">{activity.type} <span className="font-normal text-muted">{relativeTime(activity.date)}</span></p>
                    <p className="text-sm text-muted">{activity.description}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState scene="activity" title="No interactions yet" description="Record the first conversation before moving this lead to Contacted." />
            )}
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-medium">Follow-ups</h3>
            {lead.followUps?.length ? lead.followUps.map((item) => (
              <ContextFollowUpCard key={item._id} item={item} onComplete={onComplete} onLog={() => onLog(lead)} />
            )) : <p className="text-sm text-muted">No follow-ups linked to this lead.</p>}
          </section>
        </div>
      ) : null}
    </Sheet>
  );
}
