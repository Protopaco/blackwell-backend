import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { TEST_CLIENT_ID } from '../helpers/testClient.js';
import getTestPayPeriod from '../helpers/getTestPayPeriod.js';

describe('GET /api/v1/payrollReport/:clientId/:payPeriodId/additionalExpenses', () => {
  it('returns 200 with an array for a valid client and pay period', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`,
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 30_000);

  it('returns rows with the correct shape when data exists', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`,
    );
    expect(res.status).toBe(200);
    for (const row of res.body) {
      expect(typeof row.expenseName).toBe('string');
      expect(typeof row.amount).toBe('number');
    }
  }, 30_000);

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/unknown-pay-period-id/additionalExpenses`,
    );
    expect(res.status).toBe(404);
  }, 30_000);

  it('returns 404 for an unknown client', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app).get(
      `/api/v1/payrollReport/unknown-client-id/${payPeriodId}/additionalExpenses`,
    );
    expect(res.status).toBe(404);
  }, 30_000);
});

describe('PUT /api/v1/payrollReport/:clientId/:payPeriodId/additionalExpenses', () => {
  it('saves and round-trips a list of additional expenses', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const payload = [
      { expenseName: 'HSA', amount: 8400 },
      { expenseName: 'Dental', amount: 1200 },
    ];

    const putRes = await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`)
      .send(payload);
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(2);
    expect(getRes.body[0].expenseName).toBe('HSA');
    expect(getRes.body[0].amount).toBe(8400);
    expect(getRes.body[1].expenseName).toBe('Dental');
    expect(getRes.body[1].amount).toBe(1200);
  }, 60_000);

  it('overwrites previous data — PUT is a full replacement', async () => {
    const { payPeriodId } = await getTestPayPeriod();

    await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'HSA', amount: 8400 }, { expenseName: 'Dental', amount: 1200 }]);

    const putRes = await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'Vision', amount: 600 }]);
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].expenseName).toBe('Vision');
  }, 60_000);

  it('accepts an empty array to clear all additional expenses', async () => {
    const { payPeriodId } = await getTestPayPeriod();

    await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'HSA', amount: 8400 }]);

    const putRes = await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`)
      .send([]);
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${TEST_CLIENT_ID}/${payPeriodId}/additionalExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(0);
  }, 60_000);

  it('returns 404 for an unknown pay period', async () => {
    const res = await request(app)
      .put(`/api/v1/payrollReport/${TEST_CLIENT_ID}/unknown-pay-period-id/additionalExpenses`)
      .send([{ expenseName: 'HSA', amount: 8400 }]);
    expect(res.status).toBe(404);
  }, 30_000);

  it('returns 404 for an unknown client', async () => {
    const { payPeriodId } = await getTestPayPeriod();
    const res = await request(app)
      .put(`/api/v1/payrollReport/unknown-client-id/${payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'HSA', amount: 8400 }]);
    expect(res.status).toBe(404);
  }, 30_000);
});
