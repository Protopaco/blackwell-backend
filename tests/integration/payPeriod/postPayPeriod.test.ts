import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import createTestClient from '../builders/createTestClient.js';

describe('POST /api/v1/payPeriod/:clientId', () => {
  it('201 - Creates pay period', async () => {
    const client = await createTestClient();
    const nextPayPeriodRes = await request(app).get(`/api/v1/payPeriod/${client.clientId}/next`);
    expect(nextPayPeriodRes.status).toBe(200);

    const payPeriodRequest = {
      ...nextPayPeriodRes.body,
      payrollReportFileId: '',
    };

    const res = await request(app)
      .post(`/api/v1/payPeriod/${client.clientId}`)
      .send({ payPeriod: payPeriodRequest });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Pay period created');

    const payPeriodsRes = await request(app).get(`/api/v1/payPeriod/${client.clientId}`);
    expect(payPeriodsRes.status).toBe(200);

    const payPeriod = payPeriodsRes.body.find(
      (candidate: PayPeriodResponse) => candidate.payPeriodName === payPeriodRequest.payPeriodName,
    );
    expect(payPeriod).toMatchObject({
      payPeriodName: payPeriodRequest.payPeriodName,
      status: payPeriodRequest.status,
      startDate: payPeriodRequest.startDate,
      endDate: payPeriodRequest.endDate,
    });
    expect(payPeriod.payPeriodId).toBeDefined();
    expect(payPeriod.createdDate).toBeDefined();
    expect(payPeriod.payrollReportFileId).toBeUndefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .post(`/api/v1/payPeriod/${missingClientId}`)
      .send({
        payPeriod: {
          payPeriodId: crypto.randomUUID(),
          payPeriodName: 'Missing Client Pay Period',
          status: PayPeriodStatus.Open,
          startDate: '2026-01-01',
          endDate: '2026-01-14',
          createdDate: '2026-01-01',
          payrollReportFileId: '',
        },
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
