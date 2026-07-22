import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';

describe('PUT /api/v1/payrollReport/:clientId/:payPeriodId/employeeExpenses', () => {
  it('200 - Upserts a new employee expense', async () => {
    const { client, incompleteEmployee, payPeriod } = await createGeneratedPayrollReportPayPeriod();
    const expense = {
      employeeId: incompleteEmployee.employeeId,
      employeeName: `${incompleteEmployee.firstName} ${incompleteEmployee.lastName}`,
      totalExpense: 123.45,
    };

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send(expense);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Employee expense updated');

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toContainEqual(expense);
  });

  it('404 - Payroll report file not found', async () => {
    const { client, incompleteEmployee, payPeriod } = await createPayrollReportReadyPayPeriod();

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send({
        employeeId: incompleteEmployee.employeeId,
        employeeName: `${incompleteEmployee.firstName} ${incompleteEmployee.lastName}`,
        totalExpense: 123.45,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`No payroll report file exists for pay period: ${payPeriod.payPeriodId}`);
  });
});
