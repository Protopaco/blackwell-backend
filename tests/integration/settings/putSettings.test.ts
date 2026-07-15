import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import createTestClient from '../builders/createTestClient.js';

describe('PUT /api/v1/settings/:clientId', () => {
  it('200 - Updates settings', async () => {
    const client = await createTestClient();
    const updatedSettings = {
      timeInputMethod: TimeInputMethod.ClockInOut,
      payPeriodInterval: PayPeriodInterval.Monthly,
      payPeriodStartDate: '2026-02-01',
    };

    const res = await request(app)
      .put(`/api/v1/settings/${client.clientId}`)
      .send(updatedSettings);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Settings updated');

    const settingsRes = await request(app).get(`/api/v1/settings/${client.clientId}`);
    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body).toMatchObject(updatedSettings);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).put(`/api/v1/settings/${missingClientId}`).send({
      timeInputMethod: TimeInputMethod.ClockInOut,
      payPeriodInterval: PayPeriodInterval.Monthly,
      payPeriodStartDate: '2026-02-01',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
