const { connect, clear, close } = require('./db');
const { app, request, auth, bearer } = require('./helpers');

beforeAll(connect);
afterEach(clear);
afterAll(close);

describe('Dashboard', () => {
  test('15. Dashboard counts and stage distribution match the data', async () => {
    const { token } = await auth('owner@example.com');

    const first = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Meera Iyer',
      email: 'meera@iyertextiles.in',
    });
    const second = await request(app).post('/api/leads').set(bearer(token)).send({
      name: 'Rohan Desai',
      phone: '9845000111',
    });

    await request(app).post('/api/activities').set(bearer(token)).send({
      type: 'Call',
      description: 'Spoke about the catering dates',
      leadId: second.body.data._id,
    });
    await request(app).put(`/api/leads/${second.body.data._id}`).set(bearer(token)).send({ stage: 'Contacted' });

    await request(app).post('/api/opportunities').set(bearer(token)).send({
      title: 'Open catering brief',
      value: 90000,
      stage: 'Qualified',
      leadId: second.body.data._id,
    });
    await request(app).post('/api/opportunities').set(bearer(token)).send({
      title: 'Closed textile order',
      value: 40000,
      stage: 'Won',
      leadId: first.body.data._id,
    });

    const due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Share the menu options',
      dueDate: due.toISOString(),
      leadId: second.body.data._id,
    });
    const done = await request(app).post('/api/followups').set(bearer(token)).send({
      title: 'Send the catalogue',
      dueDate: due.toISOString(),
      leadId: first.body.data._id,
    });
    await request(app).patch(`/api/followups/${done.body.data._id}/complete`).set(bearer(token));

    const res = await request(app).get('/api/dashboard').set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.totalLeads).toBe(2);
    expect(res.body.data.activeOpportunities).toBe(1);
    expect(res.body.data.pendingFollowUps).toBe(1);
    expect(res.body.data.totalActivities).toBe(1);
    expect(res.body.data.stageDistribution['New Lead']).toBe(1);
    expect(res.body.data.stageDistribution.Contacted).toBe(1);
    expect(res.body.data.stageDistribution.Won).toBe(0);
    expect(res.body.data.pipelineValue).toBe(90000);
    expect(res.body.data.upcomingFollowUps).toHaveLength(1);
    expect(res.body.data.recentActivities).toHaveLength(1);
    expect(res.body.data.leadsOverTime).toHaveLength(8);
  });
});
