import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestClient from '../builders/createTestClient.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';

describe('GET /api/v1/payPeriod/:clientId/:payPeriodId', () => {
  it('200 - Gets pay period by id', async () => {
    const client = await createTestClient();
    const createdPayPeriod = await createTestPayPeriod(client.clientId);

    const res = await request(app).get(
      `/api/v1/payPeriod/${client.clientId}/${createdPayPeriod.payPeriodId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      payPeriodId: createdPayPeriod.payPeriodId,
      payPeriodName: createdPayPeriod.payPeriodName,
      status: createdPayPeriod.status,
      startDate: createdPayPeriod.startDate,
      endDate: createdPayPeriod.endDate,
      createdDate: createdPayPeriod.createdDate,
    });
    expect(res.body.payrollReportFileId).toBeUndefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/payPeriod/${missingClientId}/${payPeriodId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).get(
      `/api/v1/payPeriod/${client.clientId}/${missingPayPeriodId}`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
