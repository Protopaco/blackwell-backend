import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';

describe('GET /api/v1/payPeriod/:clientId', () => {
  it('returns 200 with a list of pay periods', async () => {
    const res = await request(app).get(`/api/v1/payPeriod/${TEST_CLIENT_ID}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns pay periods with expected fields', async () => {
    const res = await request(app).get(`/api/v1/payPeriod/${TEST_CLIENT_ID}`);
    const payPeriod = res.body[0];
    console.log('Raw pay period response:', JSON.stringify(payPeriod, null, 2));
    expect(payPeriod).toHaveProperty('payPeriodId');
    expect(payPeriod).toHaveProperty('payPeriodName');
    expect(payPeriod).toHaveProperty('status');
    expect(payPeriod).toHaveProperty('startDate');
    expect(payPeriod).toHaveProperty('endDate');
  });

  it('returns 200 with empty array for unknown client', async () => {
    const res = await request(app).get('/api/v1/payPeriod/unknown-id');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
