import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';

describe('GET /api/v1/payPeriod/next', () => {
  it('returns 200 with a suggested next pay period', async () => {
    const res = await request(app).get(`/api/v1/payPeriod/next?clientId=${TEST_CLIENT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('payPeriodName');
    expect(res.body).toHaveProperty('startDate');
    expect(res.body).toHaveProperty('endDate');
    expect(res.body.payPeriodId).toBe('');
    console.log('Next pay period:', JSON.stringify(res.body, null, 2));
  });

  it('returns 404 for unknown client', async () => {
    const res = await request(app).get('/api/v1/payPeriod/next?clientId=unknown-id');
    expect(res.status).toBe(404);
  });
});
