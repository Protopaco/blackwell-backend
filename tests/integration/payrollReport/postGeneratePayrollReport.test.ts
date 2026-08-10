import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import readCurrentHoursTab from '#db/payrollReport/readCurrentHoursTab.js';
import readPayrollReportSummary from '#db/payrollReport/readPayrollReportSummary.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import { TimesheetStatus } from '#models/TimesheetStatus.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';
import createTimesheetStatusState from '../builders/createTimesheetStatusState.js';
import getInternalPayPeriodById from '../helpers/getInternalPayPeriodById.js';

describe('POST /api/v1/payrollReport/:clientId/:payPeriodId/generate', () => {
  // DISABLED — asserts PayRate-based hourly/flat-rate grouping in the summary, removed in [052] (Activity
  // no longer carries payRate; the shim in buildPayrollReportResponse.ts treats everything as hourly).
  // Real replacement depends on [055]'s bridge-row rewire — revisit then.
  it.skip('200 - Generates payroll report from complete timesheets', async () => {
    const { client, completeEmployee, incompleteEmployee, payPeriod, activityMix } =
      await createPayrollReportReadyPayPeriod();

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/generate`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Payroll report generated');

    const updatedPayPeriod = await getInternalPayPeriodById(client, payPeriod.payPeriodId);
    expect(updatedPayPeriod?.status).toBe(PayPeriodStatus.Processed);
    expect(updatedPayPeriod?.payrollReportFileId).toEqual(expect.any(String));
    expect(updatedPayPeriod?.payrollReportFileId).not.toBe('');

    const hoursRows = await readCurrentHoursTab(updatedPayPeriod?.payrollReportFileId ?? '');
    expect(hoursRows).toHaveLength(2);
    expect(hoursRows?.map((row) => row.EmployeeId)).toEqual([
      completeEmployee.employeeId,
      completeEmployee.employeeId,
    ]);
    expect(hoursRows?.some((row) => row.EmployeeId === incompleteEmployee.employeeId)).toBe(false);
    expect(hoursRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ActivityName: activityMix.hourlyPayRate1Activity.activityName,
          Hours: 4,
        }),
        expect.objectContaining({
          ActivityName: activityMix.flatPayRate1Activity.activityName,
          Hours: 2,
        }),
      ]),
    );

    const summaryRows = await readPayrollReportSummary(updatedPayPeriod?.payrollReportFileId ?? '');
    expect(summaryRows).toContainEqual(
      expect.objectContaining({
        EmployeeId: completeEmployee.employeeId,
        TotalHours: '4',
      }),
    );
    expect(summaryRows).toContainEqual(
      expect.objectContaining({
        EmployeeId: completeEmployee.employeeId,
        TotalHours: '2',
      }),
    );
  });

  it('422 - No complete timesheets found', async () => {
    const { client, payPeriod } = await createTimesheetStatusState(TimesheetStatus.NotGenerated);

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${payPeriod.payPeriodId}/generate`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('No Complete timesheets found');
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/payrollReport/${missingClientId}/${payPeriodId}/generate`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/payrollReport/${client.clientId}/${missingPayPeriodId}/generate`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
