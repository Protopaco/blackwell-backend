import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import createTestClient from '../builders/createTestClient.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';

const createBiWeeklyClient = () =>
  createTestClient({
    settings: {
      timeInputMethod: TimeInputMethod.TotalHours,
      payPeriodInterval: PayPeriodInterval.BiWeekly,
      payPeriodStartDate: '2026-01-01',
    },
  });

describe('GET /api/v1/payPeriod/:clientId/next', () => {
  it('200 - Gets next pay period for a client with no prior pay periods', async () => {
    const client = await createBiWeeklyClient();

    const res = await request(app).get(`/api/v1/payPeriod/${client.clientId}/next`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      payPeriodId: '',
      payPeriodName: '01/01 - 01/14',
      status: PayPeriodStatus.Pending,
      startDate: '2026-01-01',
      endDate: '2026-01-14',
      createdDate: '',
    });
    expect(res.body.payrollReportFileId).toBeUndefined();
  });

  it('200 - Gets next pay period after an existing pay period', async () => {
    const client = await createBiWeeklyClient();
    const existingPayPeriod = await createTestPayPeriod(client.clientId);

    const res = await request(app).get(`/api/v1/payPeriod/${client.clientId}/next`);

    expect(res.status).toBe(200);
    expect(existingPayPeriod.endDate).toBe('2026-01-14');
    expect(res.body).toMatchObject({
      payPeriodId: '',
      payPeriodName: '01/15 - 01/28',
      status: PayPeriodStatus.Pending,
      startDate: '2026-01-15',
      endDate: '2026-01-28',
      createdDate: '',
    });
    expect(res.body.payrollReportFileId).toBeUndefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/payPeriod/${missingClientId}/next`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
