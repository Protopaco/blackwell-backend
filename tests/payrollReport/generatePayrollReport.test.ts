import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('POST /api/v1/payrollReport/:clientId/:payPeriodId/generate', () => {
  it('returns 200 or 422 depending on whether any timesheets are Complete', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/generate`,
    );
    // 200 = report generated successfully, 422 = no Complete timesheets in test data
    expect([200, 422]).toContain(res.status);
    console.log('Payroll report response:', JSON.stringify(res.body, null, 2));
  }, 60_000);

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/unknown-pay-period-id/generate`,
    );
    expect(res.status).toBe(404);
  });

  it('returns 404 for an unknown client', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).post(
      `/api/v1/payrollReport/unknown-client-id/${payPeriodId}/generate`,
    );
    expect(res.status).toBe(404);
  });
});
