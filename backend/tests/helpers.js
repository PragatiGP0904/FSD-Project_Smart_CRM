const request = require('supertest');
const app = require('../app');

async function auth(email, name = 'Test User', password = 'secret1') {
  const registered = await request(app).post('/api/auth/register').send({ name, email, password });
  return {
    token: registered.body.token,
    user: registered.body.user,
    status: registered.status,
    body: registered.body,
  };
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = { auth, bearer, app, request };
