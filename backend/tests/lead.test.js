const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

async function createLead(token, body = {}) {
  return request(app)
    .post('/api/leads')
    .set(bearer(token))
    .send({ name: 'Meera Iyer', email: 'meera@iyertextiles.in', company: 'Iyer Textiles', source: 'Website', ...body });
}

describe('Leads', () => {
  test('6. Create a lead with a name and no contact detail returns a validation error', async () => {
    const { token } = await auth('owner@example.com');
    const res = await request(app).post('/api/leads').set(bearer(token)).send({ name: 'Meera Iyer' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/contact detail/i);
  });

  test('7. Create a lead with valid data saves it in New Lead stage', async () => {
    const { token } = await auth('owner@example.com');
    const res = await createLead(token);
    expect(res.status).toBe(201);
    expect(res.body.data.stage).toBe('New Lead');
    expect(res.body.data.name).toBe('Meera Iyer');
    expect(res.body.data.email).toBe('meera@iyertextiles.in');
  });

  test('8. Move a lead from New Lead to Proposal returns 400', async () => {
    const { token } = await auth('owner@example.com');
    const created = await createLead(token);
    const res = await request(app)
      .put(`/api/leads/${created.body.data._id}`)
      .set(bearer(token))
      .send({ stage: 'Proposal' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Cannot move a lead from New Lead to Proposal');
  });

  test('9. Mark a lead Contacted with no activity returns 400', async () => {
    const { token } = await auth('owner@example.com');
    const created = await createLead(token);
    const res = await request(app)
      .put(`/api/leads/${created.body.data._id}`)
      .set(bearer(token))
      .send({ stage: 'Contacted' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Record an interaction before marking the lead as Contacted');
  });

  test('10. Move a Proposal lead to Won sets the stage and creates a customer', async () => {
    const { token, user } = await auth('owner@example.com');
    const created = await createLead(token, { phone: '9845011122', company: 'Iyer Textiles' });
    const leadId = created.body.data._id;

    await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Call',
      description: 'Introduced the textile range',
      leadId,
    });

    for (const stage of ['Contacted', 'Qualified', 'Proposal', 'Won']) {
      const moved = await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ stage });
      expect(moved.status).toBe(200);
    }

    const lead = await request(app).get(`/api/leads/${leadId}`).set(bearer(token));
    expect(lead.body.data.stage).toBe('Won');
    expect(lead.body.data.customerId).toBeTruthy();

    const customer = await Customer.findById(lead.body.data.customerId);
    expect(customer).toBeTruthy();
    expect(customer.name).toBe('Meera Iyer');
    expect(customer.email).toBe('meera@iyertextiles.in');
    expect(customer.phone).toBe('9845011122');
    expect(customer.company).toBe('Iyer Textiles');
    expect(customer.status).toBe('Active');
    expect(String(customer.createdBy)).toBe(String(user.id));

    const again = await request(app).put(`/api/leads/${leadId}`).set(bearer(token)).send({ notes: 'Closed after the site visit' });
    expect(again.status).toBe(200);
    expect(String(again.body.data.customerId)).toBe(String(customer._id));
    expect(await Customer.countDocuments({ createdBy: user.id })).toBe(1);
  });

  test('11. Read another user\'s lead by id returns 404', async () => {
    const first = await auth('first@example.com');
    const second = await auth('second@example.com', 'Second User');
    const created = await createLead(first.token);
    const res = await request(app).get(`/api/leads/${created.body.data._id}`).set(bearer(second.token));
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  test('deleting a lead removes its activities', async () => {
    const { token } = await auth('owner@example.com');
    const created = await createLead(token);
    const leadId = created.body.data._id;
    await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Note',
      description: 'Asked for a catalogue',
      leadId,
    });
    const removed = await request(app).delete(`/api/leads/${leadId}`).set(bearer(token));
    expect(removed.status).toBe(200);
    expect(await Activity.countDocuments({ leadId })).toBe(0);
  });
});
