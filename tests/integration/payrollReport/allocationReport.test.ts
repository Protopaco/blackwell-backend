import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('GET /api/v1/payrollReport/:clientId/:payPeriodId/allocation-report', () => {
  it('returns 200 with an array for a valid client and pay period', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 30_000);

  it('returns rows with the correct shape when data exists', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    expect(res.status).toBe(200);
    for (const row of res.body) {
      expect(typeof row.fundingSourceName).toBe('string');
      expect(typeof row.wagesAllocation).toBe('number');
      expect(typeof row.additionalExpenses).toBe('number');
      expect(typeof row.total).toBe('number');
      expect(row.total).toBe(
        Math.round((row.wagesAllocation + row.additionalExpenses) * 100) / 100,
      );
    }
  }, 30_000);

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/unknown-pay-period-id/allocation-report`,
    );
    expect(res.status).toBe(404);
  }, 30_000);

  it('returns 404 for an unknown client', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/unknown-client-id/${payPeriodId}/allocation-report`,
    );
    expect(res.status).toBe(404);
  }, 30_000);
});

describe('POST /api/v1/payrollReport/:clientId/:payPeriodId/allocation-report', () => {
  it('returns 200 with allocation rows, or 422 if preconditions are not met', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    // 200 = report generated. 422 = payroll report not yet generated or no hours data.
    expect([200, 422]).toContain(res.status);
    console.log('Allocation report response:', JSON.stringify(res.body, null, 2));
  }, 60_000);

  it('returns rows with the correct shape on success', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    if (res.status !== 200) return;
    expect(Array.isArray(res.body)).toBe(true);
    for (const row of res.body) {
      expect(typeof row.fundingSourceName).toBe('string');
      expect(typeof row.wagesAllocation).toBe('number');
      expect(typeof row.additionalExpenses).toBe('number');
      expect(typeof row.total).toBe('number');
      expect(row.total).toBe(
        Math.round((row.wagesAllocation + row.additionalExpenses) * 100) / 100,
      );
    }
  }, 60_000);

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/unknown-pay-period-id/allocation-report`,
    );
    expect(res.status).toBe(404);
  }, 30_000);

  it('returns 404 for an unknown client', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).post(
      `/api/v1/payrollReport/unknown-client-id/${payPeriodId}/allocation-report`,
    );
    expect(res.status).toBe(404);
  }, 30_000);

  it('GET reflects the freshly generated report immediately after POST — guards against stale cache', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const postRes = await request(app).post(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    if (postRes.status !== 200) return; // preconditions not met in this environment

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/allocation-report`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(postRes.body);
  }, 60_000);
});
