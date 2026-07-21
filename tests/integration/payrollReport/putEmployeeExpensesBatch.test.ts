import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';

describe('PUT /api/v1/payrollReport/:clientId/:payPeriodId/employeeExpenses/batch', () => {
  it('200 - Updates existing and new employee expenses', async () => {
    const { client, completeEmployee, incompleteEmployee, payPeriod } =
      await createGeneratedPayrollReportPayPeriod();
    const completeEmployeeExpense = {
      employeeId: completeEmployee.employeeId,
      employeeName: `${completeEmployee.firstName} ${completeEmployee.lastName}`,
      totalExpense: 10,
    };

    const seedRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send(completeEmployeeExpense);
    expect(seedRes.status).toBe(200);

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses/batch`)
      .send([
        { employeeId: completeEmployee.employeeId, totalExpense: 15 },
        { employeeId: incompleteEmployee.employeeId, totalExpense: 20 },
      ]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Employee expenses updated');

    const getRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );
    expect(getRes.status).toBe(200);
    expect(getRes.body).toContainEqual({
      ...completeEmployeeExpense,
      totalExpense: 15,
    });
    expect(getRes.body).toContainEqual({
      employeeId: incompleteEmployee.employeeId,
      employeeName: `${incompleteEmployee.firstName} ${incompleteEmployee.lastName}`,
      totalExpense: 20,
    });
  });

  it('404 - Payroll report file not found', async () => {
    const { client, incompleteEmployee, payPeriod } = await createPayrollReportReadyPayPeriod();

    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses/batch`)
      .send([{ employeeId: incompleteEmployee.employeeId, totalExpense: 20 }]);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`No payroll report file exists for pay period: ${payPeriod.payPeriodId}`);
  });

  it('422 - Rejects unknown employee ids without writing partial updates', async () => {
    const { client, completeEmployee, payPeriod } = await createGeneratedPayrollReportPayPeriod();
    const existingExpense = {
      employeeId: completeEmployee.employeeId,
      employeeName: `${completeEmployee.firstName} ${completeEmployee.lastName}`,
      totalExpense: 10,
    };

    const seedRes = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`)
      .send(existingExpense);
    expect(seedRes.status).toBe(200);

    const beforeRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );
    expect(beforeRes.status).toBe(200);

    const missingEmployeeId = crypto.randomUUID();
    const res = await request(app)
      .put(`/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses/batch`)
      .send([
        { employeeId: completeEmployee.employeeId, totalExpense: 99 },
        { employeeId: missingEmployeeId, totalExpense: 20 },
      ]);

    expect(res.status).toBe(422);
    expect(res.body.message).toContain(`Unknown employeeId(s) in employeeExpenses batch: ${missingEmployeeId}`);

    const afterRes = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );
    expect(afterRes.status).toBe(200);
    expect(afterRes.body).toEqual(beforeRes.body);
  });
});
