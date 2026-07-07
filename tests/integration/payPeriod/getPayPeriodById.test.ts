import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('GET /api/v1/payPeriod/:clientId/:payPeriodId', () => {
  it('returns 200 with the pay period', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(`/api/v1/payPeriod/${TEST_CLIENT_ID}/${payPeriodId}`);
    expect(res.status).toBe(200);
    expect(res.body.payPeriodId).toBe(payPeriodId);
  });

  it('returns 404 for unknown pay period', async () => {
    const res = await request(app).get(`/api/v1/payPeriod/${TEST_CLIENT_ID}/unknown-id`);
    expect(res.status).toBe(404);
  });
});
