import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Activity from '#models/Activity.js';
import Employee from '#models/Employee.js';
import FundingSource from '#models/FundingSource.js';
import Holiday from '#models/Holiday.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';
import Supervisor from '#models/Supervisor.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import createPayrollReportReadyPayPeriod from '../builders/createPayrollReportReadyPayPeriod.js';
import createTestClient from '../builders/createTestClient.js';
import createTestHoliday from '../builders/createTestHoliday.js';
import createTestSupervisor from '../builders/createTestSupervisor.js';

describe('GET /api/v1/client/:clientId/summary', () => {
  it('200 - Gets summary for fresh client', async () => {
    const settings = {
      timeInputMethod: TimeInputMethod.TotalHours,
      payPeriodInterval: PayPeriodInterval.BiWeekly,
      payPeriodStartDate: '2026-01-01',
    };
    const client = await createTestClient({ settings });

    const res = await request(app).get(`/api/v1/client/${client.clientId}/summary`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      employees: [],
      supervisors: [],
      activities: [],
      fundingSources: [],
      holidays: [],
      settings,
      payPeriods: [],
    });
  });

  it('200 - Gets summary for populated client', async () => {
    const {
      client,
      completeEmployee,
      incompleteEmployee,
      payPeriod,
      activityMix,
    } = await createPayrollReportReadyPayPeriod();
    const supervisor = await createTestSupervisor(client.clientId);
    const holiday = await createTestHoliday(client.clientId);
    const fundingSourceName = activityMix.hourlyPayRate1Activity.fundingSources[0].fundingSourceName;

    const res = await request(app).get(`/api/v1/client/${client.clientId}/summary`);

    expect(res.status).toBe(200);
    expect(res.body.settings).toMatchObject({
      timeInputMethod: expect.any(String),
      payPeriodInterval: expect.any(String),
      payPeriodStartDate: expect.any(String),
    });
    expect(res.body.employees.map((employee: Employee) => employee.employeeId)).toEqual(
      expect.arrayContaining([completeEmployee.employeeId, incompleteEmployee.employeeId]),
    );
    expect(res.body.supervisors).toContainEqual(
      expect.objectContaining({
        supervisorId: supervisor.supervisorId,
        email: supervisor.email,
      }),
    );
    expect(res.body.activities.map((activity: Activity) => activity.activityId)).toEqual(
      expect.arrayContaining(activityMix.activities.map((activity) => activity.activityId)),
    );
    expect(res.body.fundingSources.map((fundingSource: FundingSource) => fundingSource.fundingSourceName)).toContain(
      fundingSourceName,
    );
    expect(res.body.holidays).toContainEqual(
      expect.objectContaining({
        holidayId: holiday.holidayId,
        holidayName: holiday.holidayName,
        holidayDate: holiday.holidayDate,
      }),
    );
    expect(res.body.payPeriods).toContainEqual(
      expect.objectContaining({
        payPeriodId: payPeriod.payPeriodId,
        payPeriodName: payPeriod.payPeriodName,
        status: payPeriod.status,
        startDate: payPeriod.startDate,
        endDate: payPeriod.endDate,
        createdDate: payPeriod.createdDate,
      }),
    );
    expect(
      res.body.payPeriods.find((candidate: PayPeriodResponse) => candidate.payPeriodId === payPeriod.payPeriodId)
        .payrollReportFileId,
    ).toBeUndefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/client/${missingClientId}/summary`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
