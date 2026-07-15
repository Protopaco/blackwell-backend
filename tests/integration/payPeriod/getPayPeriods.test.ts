import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';
import createTestClient from '../builders/createTestClient.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';

describe('GET /api/v1/payPeriod/:clientId', () => {
  it('200 - Gets empty pay period list', async () => {
    const client = await createTestClient();

    const res = await request(app).get(`/api/v1/payPeriod/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('200 - Gets pay periods for a client', async () => {
    const client = await createTestClient();
    const createdPayPeriod = await createTestPayPeriod(client.clientId);

    const res = await request(app).get(`/api/v1/payPeriod/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(res.body).toContainEqual(
      expect.objectContaining({
        payPeriodId: createdPayPeriod.payPeriodId,
        payPeriodName: createdPayPeriod.payPeriodName,
        status: createdPayPeriod.status,
        startDate: createdPayPeriod.startDate,
        endDate: createdPayPeriod.endDate,
        createdDate: createdPayPeriod.createdDate,
      }),
    );

    const payPeriod = res.body.find(
      (candidate: PayPeriodResponse) => candidate.payPeriodId === createdPayPeriod.payPeriodId,
    );
    expect(payPeriod.payrollReportFileId).toBeUndefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/payPeriod/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
