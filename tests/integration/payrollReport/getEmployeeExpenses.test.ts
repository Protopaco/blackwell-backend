import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createGeneratedPayrollReportPayPeriod from '../builders/createGeneratedPayrollReportPayPeriod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';

describe('GET /api/v1/payrollReport/:clientId/:payPeriodId/employeeExpenses', () => {
  it('200 - Gets employee expenses for a generated payroll report', async () => {
    const { client, payPeriod } = await createGeneratedPayrollReportPayPeriod();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('404 - Payroll report file not found', async () => {
    const { client, payPeriod } = await createPayrollReportReadyPayPeriod();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/employeeExpenses`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`No payroll report file exists for pay period: ${payPeriod.payPeriodId}`);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).get(
      `/api/v1/payrollReport/${missingClientId}/${payPeriodId}/employeeExpenses`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).get(
      `/api/v1/payrollReport/${client.clientId}/${missingPayPeriodId}/employeeExpenses`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
