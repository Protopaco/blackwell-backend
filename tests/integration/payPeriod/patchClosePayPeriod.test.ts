import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';

describe('PATCH /api/v1/payPeriod/:clientId/:payPeriodId/close', () => {
  it('200 - Closes allocated pay period', async () => {
    const { client, completeEmployee, payPeriod } = await createGeneratedPayrollReportPayPeriod();
    const employeeExpense = {
      employeeId: completeEmployee.employeeId,
      employeeName: `${completeEmployee.firstName} ${completeEmployee.lastName}`,
      totalExpense: 200,
    };
    const additionalExpenses = [
      { expenseName: 'Mileage', amount: 40 },
      { expenseName: 'Supplies', amount: 60 },
    ];

    const employeeExpensesRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send(employeeExpense);
    expect(employeeExpensesRes.status).toBe(200);

    const additionalExpensesRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/additionalExpenses`)
      .send(additionalExpenses);
    expect(additionalExpensesRes.status).toBe(200);

    const allocationReportRes = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/allocationReport`,
    );
    expect(allocationReportRes.status).toBe(200);

    const res = await request(app).patch(
      `/api/v1/payPeriod/${client.clientId}/${payPeriod.payPeriodId}/close`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Pay period closed');

    const getRes = await request(app).get(
      `/api/v1/payPeriod/${client.clientId}/${payPeriod.payPeriodId}`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body.status).toBe(PayPeriodStatus.Closed);
  });

  it('422 - Rejects pay period before processed status', async () => {
    const client = await createTestClient();
    const payPeriod = await createTestPayPeriod(client.clientId);

    const res = await request(app).patch(
      `/api/v1/payPeriod/${client.clientId}/${payPeriod.payPeriodId}/close`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(
      `Cannot close pay period ${payPeriod.payPeriodId} with status ${PayPeriodStatus.Pending}. Must be Allocated.`,
    );
  });

  it('422 - Rejects pay period that is Processed but not yet Allocated', async () => {
    const { client, payPeriod } = await createGeneratedPayrollReportPayPeriod();

    const res = await request(app).patch(
      `/api/v1/payPeriod/${client.clientId}/${payPeriod.payPeriodId}/close`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(
      `Cannot close pay period ${payPeriod.payPeriodId} with status ${PayPeriodStatus.Processed}. Must be Allocated.`,
    );
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).patch(`/api/v1/payPeriod/${missingClientId}/${payPeriodId}/close`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).patch(
      `/api/v1/payPeriod/${client.clientId}/${missingPayPeriodId}/close`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
