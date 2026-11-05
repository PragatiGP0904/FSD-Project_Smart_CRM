const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Activities', () => {
  test('records an interaction against an owned lead', async () => {
    const { token } = await auth('owner@example.com');
    const lead = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Ananya Shah',
      phone: '9822012345',
    });
    const created = await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Meeting',
      description: 'Discussed the clinic renovation',
      leadId: lead.body.data._id,
    });
    expect(created.status).toBe(201);
    expect(created.body.data.type).toBe('Meeting');

    const list = await request(app).get(`/api/activities?leadId=${lead.body.data._id}`).set(bearer(token));
    expect(list.body.count).toBe(1);
  });

  test('rejects an activity with no lead or customer', async () => {
    const { token } = await auth('owner@example.com');
    const res = await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Call',
      description: 'Tried the office number',
    });
    expect(res.status).toBe(400);
  });
});
