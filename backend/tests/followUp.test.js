const FollowUp = require('../models/FollowUp');
const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Follow-ups', () => {
  test('12. Schedule a follow-up for a lead stores stage and last interaction', async () => {
    const { token } = await auth('owner@example.com');
    const lead = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Arjun Kumar',
      email: 'arjun@kumarinteriors.in',
      company: 'Kumar Interiors',
    });
    const leadId = lead.body.data._id;
    await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Call',
      description: 'Asked about the office renovation',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      leadId,
    });
    await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Meeting',
      description: 'Quotation discussed with the customer',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      leadId,
    });
    await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage: 'Contacted' });
    await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage: 'Qualified' });
    await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage: 'Proposal' });

    const due = new Date();
    due.setDate(due.getDate() + 1);
    const res = await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Call to check whether the quotation is acceptable',
      dueDate: due.toISOString(),
      priority: 'High',
      leadId,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.context.name).toBe('Arjun Kumar');
    expect(res.body.data.context.stage).toBe('Proposal');
    expect(res.body.data.context.lastInteraction).toBe('Meeting: Quotation discussed with the customer');
    expect(res.body.data.priority).toBe('High');
    expect(res.body.data.status).toBe('Pending');
  });

  test('13. Fetch follow-ups after the due date shows the pending item as Overdue', async () => {
    const { token, user } = await auth('owner@example.com');
    const lead = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Arjun Kumar',
      email: 'arjun@kumarinteriors.in',
    });
    await FollowUp.create({
      title: 'Call to confirm the site visit',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      priority: 'Medium',
      status: 'Pending',
      leadId: lead.body.data._id,
      context: { name: 'Arjun Kumar', stage: 'New Lead', lastInteraction: 'No interaction recorded yet' },
      createdBy: user.id,
    });

    const res = await request(app).get('/api/followups').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('Overdue');
  });

  test('14. Mark a follow-up completed sets status Completed', async () => {
    const { token } = await auth('owner@example.com');
    const lead = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Arjun Kumar',
      phone: '9812345678',
    });
    const due = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const created = await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Send the revised quotation',
      dueDate: due.toISOString(),
      leadId: lead.body.data._id,
    });
    const completed = await request(app)
      .patch(`/api/followups/${created.body.data._id}/complete`)
      .set(bearer(token));
    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe('Completed');
    expect(completed.body.data.completedAt).toBeTruthy();

    const dashboard = await request(app).get('/api/dashboard').set(bearer(token));
    expect(dashboard.body.data.pendingFollowUps).toBe(0);
  });
});
