import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/services/api';

export function invalidateWorkspace(queryClient) {
  ['dashboard', 'leads', 'lead', 'customers', 'customer', 'opportunities', 'activities', 'followups', 'pipeline'].forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.patch(`/followups/${id}/complete`)).data,
    onSuccess: (_data, id) => {
      toast.success('Follow-up completed', {
        action: {
          label: 'Undo',
          onClick: async () => {
            await api.put(`/followups/${id}`, { status: 'Pending' });
            toast.success('Follow-up restored');
            invalidateWorkspace(queryClient);
          },
        },
      });
      invalidateWorkspace(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
