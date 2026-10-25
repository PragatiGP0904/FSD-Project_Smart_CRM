import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { AppShell } from '@/components/layout/AppShell';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthContext';
import { PageMetaProvider } from '@/context/PageMetaContext';
import { ThemeProvider } from '@/context/ThemeContext';

const sample = {
  _id: '1',
  priority: 'High',
  status: 'Pending',
  dueDate: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
  title: 'Call to check whether the quotation is acceptable',
  context: {
    name: 'Arjun Kumar',
    stage: 'Proposal',
    lastInteraction: 'Meeting: Quotation discussed with the customer',
    lastInteractionAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
};

test('Context follow-up card shows the customer, stage, last interaction, and next action', () => {
  render(<ContextFollowUpCard item={sample} onComplete={() => {}} onLog={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Arjun Kumar' })).toBeInTheDocument();
  expect(screen.getByText('Proposal')).toBeInTheDocument();
  expect(screen.getByText(/Quotation discussed with the customer/)).toBeInTheDocument();
  expect(screen.getByText(/Call to check whether the quotation is acceptable/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Mark completed' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Log call' })).toBeInTheDocument();
});

test('16. Layout adapts at phone width; navigation stays usable', () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <PageMetaProvider>
              <MemoryRouter>
                <AppShell />
              </MemoryRouter>
            </PageMetaProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );

  const opener = screen.getByRole('button', { name: 'Open navigation' });
  expect(opener.className).toContain('md:hidden');
  expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Follow-ups' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open command menu' })).toBeInTheDocument();
});
