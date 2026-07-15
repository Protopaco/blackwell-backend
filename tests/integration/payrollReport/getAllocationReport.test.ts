import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';

describe('GET /api/v1/payrollReport/:clientId/:payPeriodId/allocationReport', () => {
  it('200 - Gets empty allocation report before allocation generation', async () => {
    const { client, payPeriod } = await createGeneratedPayrollReportPayPeriod();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('200 - Gets generated allocation report', async () => {
    const { client, completeEmployee, payPeriod, activityMix } = await createGeneratedPayrollReportPayPeriod();
    const employeeExpense = {
      employeeId: completeEmployee.employeeId,
      employeeName: `${completeEmployee.firstName} ${completeEmployee.lastName}`,
      activeThisPayPeriod: true,
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

    const generateRes = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );
    expect(generateRes.status).toBe(200);

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([expectedRow]);
  });

  it('404 - Payroll report file not found', async () => {
    const { client, payPeriod } = await createPayrollReportReadyPayPeriod();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`No payroll report file exists for pay period: ${payPeriod.payPeriodId}`);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).get(
      `/api/v1/payrollReport/${missingClientId}/${payPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${missingPayPeriodId}/allocationReport`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
