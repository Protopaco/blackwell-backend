import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';

describe('PUT /api/v1/payrollReport/:clientId/:payPeriodId/additionalExpenses', () => {
  it('200 - Saves additional expenses', async () => {
    const { client, payPeriod } = await createGeneratedPayrollReportPayPeriod();
    const expenses = [
      { expenseName: 'Mileage', amount: 42.5 },
      { expenseName: 'Supplies', amount: 18.75 },
    ];

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send(expenses);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Additional expenses saved');

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(expenses);
  });

  it('200 - Replaces existing additional expenses', async () => {
    const { client, payPeriod } = await createGeneratedPayrollReportPayPeriod();
    const initialExpenses = [
      { expenseName: 'Mileage', amount: 42.5 },
      { expenseName: 'Supplies', amount: 18.75 },
    ];
    const replacementExpenses = [
      { expenseName: 'Equipment Rental', amount: 125 },
    ];

    const seedRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send(initialExpenses);
    expect(seedRes.status).toBe(200);

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send(replacementExpenses);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Additional expenses saved');

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual(replacementExpenses);
  });

  it('404 - Payroll report file not found', async () => {
    const { client, payPeriod } = await createPayrollReportReadyPayPeriod();

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'Mileage', amount: 42.5 }]);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`No payroll report file exists for pay period: ${payPeriod.payPeriodId}`);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/payrollReport/${missingClientId}/${payPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'Mileage', amount: 42.5 }]);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${missingPayPeriodId}/additionalExpenses`)
      .send([{ expenseName: 'Mileage', amount: 42.5 }]);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
