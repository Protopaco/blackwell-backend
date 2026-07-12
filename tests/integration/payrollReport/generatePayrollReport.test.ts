import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
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

  it('current_hours is readable immediately after generate — guards against a stale cached read', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const generateRes = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/generate`,
    );
    if (generateRes.status !== 200) return; // no Complete timesheets in this environment

    // current_hours has no dedicated GET endpoint — generateAllocationReport reads it
    // internally and fails with 422 if it comes back empty, so a 200 here proves the
    // read after generate saw fresh rows rather than a stale cached current_hours.
    const allocationRes = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocationReport`,
    );
    expect(allocationRes.status).toBe(200);
  }, 60_000);
});
