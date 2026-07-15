import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import createTestClient from '../builders/createTestClient.js';

describe('GET /api/v1/settings/:clientId', () => {
  it('200 - Gets settings for a client', async () => {
    const client = await createTestClient();

    const res = await request(app).get(`/api/v1/settings/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      timeInputMethod: TimeInputMethod.TotalHours,
      payPeriodInterval: PayPeriodInterval.BiWeekly,
      payPeriodStartDate: '2026-01-01',
    });
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/settings/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
