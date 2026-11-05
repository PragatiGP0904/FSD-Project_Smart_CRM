const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Opportunities', () => {
  test('creates an opportunity only for an owned lead', async () => {
    const { token } = await auth('owner@example.com');
    const lead = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Rohan Desai',
      email: 'rohan@desaicatering.in',
      company: 'Desai Catering',
    });
    const created = await request(app).post('/api/opportunities').set(bearer(token)).send({
      title: 'Wedding catering package',
      value: 180000,
      leadId: lead.body.data._id,
      probability: 40,
    });
    expect(created.status).toBe(201);
    expect(created.body.data.value).toBe(180000);
    expect(created.body.data.stage).toBe('New Lead');

    const other = await auth('other@example.com', 'Other User');
    const denied = await request(app).post('/api/opportunities').set(bearer(other.token)).send({
      title: 'Wedding catering package',
      value: 180000,
      leadId: lead.body.data._id,
    });
    expect(denied.status).toBe(404);
  });
});
