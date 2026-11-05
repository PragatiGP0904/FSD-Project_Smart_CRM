import { afterEach, expect, test } from 'vitest';
import api from '@/services/api';
import { DEMO_SESSION_KEY } from '@/services/demoApi';

afterEach(() => {
  localStorage.removeItem(DEMO_SESSION_KEY);
});

test('sample demo serves the dashboard and example records without a backend', async () => {
  localStorage.setItem(DEMO_SESSION_KEY, 'true');

  const [dashboard, leads, followUps] = await Promise.all([
    api.get('/dashboard'),
    api.get('/leads', { params: { page: 1, limit: 10 } }),
    api.get('/followups'),
  ]);

  expect(dashboard.data.data.totalLeads).toBeGreaterThan(0);
  expect(leads.data.data).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: 'Arjun Kumar', stage: 'Proposal' }),
  ]));
  expect(followUps.data.data).toEqual(expect.arrayContaining([
    expect.objectContaining({ title: expect.stringContaining('quotation') }),
  ]));
});

test('sample demo rejects writes with a clear read-only message', async () => {
  localStorage.setItem(DEMO_SESSION_KEY, 'true');

  await expect(api.post('/leads', { name: 'Not saved' })).rejects.toMatchObject({
    response: {
      status: 403,
      data: { message: 'Sample demo is read-only. Changes are not saved.' },
    },
  });
});
