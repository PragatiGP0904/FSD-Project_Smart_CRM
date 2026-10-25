const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Customers', () => {
  test('creates, lists and updates a customer owned by the user', async () => {
    const { token } = await auth('owner@example.com');
    const created = await request(app).post('/api/customers').set(bearer(token)).send({
      name: 'Farhan Ali',
      email: 'farhan@alispice.in',
      company: 'Ali Spice Co',
      status: 'Active',
    });
    expect(created.status).toBe(201);

    const list = await request(app).get('/api/customers?search=spice').set(bearer(token));
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);

    const updated = await request(app)
      .put(`/api/customers/${created.body.data._id}`)
      .set(bearer(token))
      .send({ phone: '9845099988' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.phone).toBe('9845099988');
  });

  test('hides another user customer', async () => {
    const first = await auth('first@example.com');
    const second = await auth('second@example.com', 'Second User');
    const created = await request(app).post('/api/customers').set(bearer(first.token)).send({
      name: 'Farhan Ali',
      phone: '9845099988',
    });
    const res = await request(app).get(`/api/customers/${created.body.data._id}`).set(bearer(second.token));
    expect(res.status).toBe(404);
  });
});
