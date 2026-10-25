const Customer = require('../models/Customer');
const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Signature workflow', () => {
  test('lead, interaction, won customer, context follow-up and dashboard stay in step', async () => {
    const { token } = await auth('owner@example.com', 'Pragati GP');
    const created = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Arjun Kumar',
      email: 'arjun@kumarinteriors.in',
      phone: '9811122233',
      company: 'Kumar Interiors',
      source: 'Referral',
    });
    const leadId = created.body.data._id;

    const activity = await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Meeting',
      description: 'Quotation discussed with the customer',
      leadId,
    });
    expect(activity.status).toBe(201);

    for (const stage of ['Contacted', 'Qualified', 'Proposal']) {
      const moved = await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage });
      expect(moved.status).toBe(200);
    }

    const won = await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage: 'Won' });
    expect(won.status).toBe(200);
    expect(won.body.data.stage).toBe('Won');
    const customer = await Customer.findById(won.body.data.customerId);
    expect(customer.name).toBe('Arjun Kumar');

    const due = new Date();
    due.setDate(due.getDate() + 1);
    const followUp = await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Call to check whether the quotation is acceptable',
      dueDate: due.toISOString(),
      priority: 'High',
      customerId: customer._id,
    });
    expect(followUp.status).toBe(201);
    expect(followUp.body.data.context).toMatchObject({
      name: 'Arjun Kumar',
      stage: 'Customer',
      lastInteraction: 'No interaction recorded yet',
    });

    const onLead = await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Call to check whether the quotation is acceptable',
      dueDate: due.toISOString(),
      priority: 'High',
      leadId,
    });
    expect(onLead.body.data.context.stage).toBe('Won');
    expect(onLead.body.data.context.lastInteraction).toBe('Meeting: Quotation discussed with the customer');

    const completed = await request(app).patch(`/api/followups/${onLead.body.data._id}/complete`).set(bearer(token));
    expect(completed.body.data.status).toBe('Completed');

    const dashboard = await request(app).get('/api/dashboard').set(bearer(token));
    expect(dashboard.body.data.totalLeads).toBe(1);
    expect(dashboard.body.data.totalActivities).toBe(1);
    expect(dashboard.body.data.stageDistribution.Won).toBe(1);
    expect(dashboard.body.data.pendingFollowUps).toBe(1);
  });
});
