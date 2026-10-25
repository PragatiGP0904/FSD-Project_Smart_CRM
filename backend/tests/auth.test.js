const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connect, clear, close } = require('./db');
const { app, request } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Authentication', () => {
  test('1. Register with a new e-mail creates a user; password stored only as a hash', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'Asha@Example.com',
      password: 'secret1',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('asha@example.com');
    expect(res.body.user.role).toBe('salesperson');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('secret1');

    const stored = await User.findOne({ email: 'asha@example.com' }).select('+passwordHash');
    expect(stored).toBeTruthy();
    expect(stored.passwordHash).not.toBe('secret1');
    expect(stored.passwordHash.startsWith('$2')).toBe(true);
    expect(await bcrypt.compare('secret1', stored.passwordHash)).toBe(true);
  });

  test('2. Register with an existing e-mail returns 400', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'asha@example.com',
      password: 'secret1',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'asha@example.com',
      password: 'secret1',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('3. Login with valid credentials returns token and user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'asha@example.com',
      password: 'secret1',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'asha@example.com',
      password: 'secret1',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({
      name: 'Asha Menon',
      email: 'asha@example.com',
      role: 'salesperson',
    });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('4. Login with a wrong password returns 401', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'asha@example.com',
      password: 'secret1',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'asha@example.com',
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test('5. Protected route without a token returns 401', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  test('registration rejects a role sent by the client', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Asha Menon',
      email: 'asha@example.com',
      password: 'secret1',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/role cannot be set/i);
  });
});
