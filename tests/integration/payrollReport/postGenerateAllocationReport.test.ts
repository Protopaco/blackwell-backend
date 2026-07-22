import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';

describe('POST /api/v1/payrollReport/:clientId/:payPeriodId/allocationReport', () => {
  it('200 - Generates allocation report', async () => {
    const { client, completeEmployee, payPeriod, activityMix } = await createGeneratedPayrollReportPayPeriod();
    const employeeExpense = {
      employeeId: completeEmployee.employeeId,
      employeeName: `${completeEmployee.firstName} ${completeEmployee.lastName}`,
      totalExpense: 200,
    };
    const additionalExpenses = [
      { expenseName: 'Mileage', amount: 40 },
      { expenseName: 'Supplies', amount: 60 },
    ];
    const expectedRow = {
      fundingSourceName: activityMix.hourlyPayRate1Activity.fundingSources[0].fundingSourceName,
      wagesAllocation: 200,
      additionalExpenses: 100,
      total: 300,
    };

    const employeeExpensesRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send(employeeExpense);
    expect(employeeExpensesRes.status).toBe(200);

    const additionalExpensesRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send(additionalExpenses);
    expect(additionalExpensesRes.status).toBe(200);

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([expectedRow]);

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual([expectedRow]);
  });

  it('422 - Payroll report not yet generated', async () => {
    const client = await createTestClient();
    const payPeriod = await createTestPayPeriod(client.clientId);

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(
      'Cannot generate allocation report — payroll report has not been generated yet for this pay period',
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/payrollReport/${missingClientId}/${payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${missingPayPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
