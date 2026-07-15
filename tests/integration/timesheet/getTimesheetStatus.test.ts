import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import EmployeeTimesheetStatus from '#models/EmployeeTimesheetStatus.js';
import { TimesheetStatus, TimesheetStatusType } from '#models/TimesheetStatus.js';
import createTestClient from '../builders/createTestClient.js';
import createTimesheetStatusState from '../builders/createTimesheetStatusState.js';

const getEmployeeStatus = async (
  clientId: string,
  payPeriodId: string,
): Promise<EmployeeTimesheetStatus> => {
  const res = await request(app).get(`/api/v1/timesheet/status/${clientId}/${payPeriodId}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  return res.body[0];
};

const expectStatus = async (status: TimesheetStatusType) => {
  const { client, employee, payPeriod } = await createTimesheetStatusState(status);

  const employeeStatus = await getEmployeeStatus(client.clientId, payPeriod.payPeriodId);

  expect(employeeStatus.employeeId).toBe(employee.employeeId);
  expect(employeeStatus.employeeName).toBe(`${employee.firstName} ${employee.lastName}`);
  expect(employeeStatus.timesheetFileId).toBe(employee.timesheetFileId);
  expect(employeeStatus.status).toBe(status);
  return employeeStatus;
};

describe('GET /api/v1/timesheet/status/:clientId/:payPeriodId', () => {
  it('200 - Gets NotGenerated timesheet status', async () => {
    const employeeStatus = await expectStatus(TimesheetStatus.NotGenerated);

    expect(employeeStatus.totalHours).toBeNull();
    expect(employeeStatus.flatRateQuantity).toBeNull();
    expect(employeeStatus.employeeSigned).toBe(false);
    expect(employeeStatus.supervisorSigned).toBe(false);
  });

  it('200 - Gets Generated timesheet status', async () => {
    const employeeStatus = await expectStatus(TimesheetStatus.Generated);

    expect(employeeStatus.totalHours).toBe(0);
    expect(employeeStatus.employeeSigned).toBe(false);
    expect(employeeStatus.supervisorSigned).toBe(false);
  });

  it('200 - Gets Submitted timesheet status', async () => {
    const employeeStatus = await expectStatus(TimesheetStatus.Submitted);

    expect(employeeStatus.employeeSigned).toBe(true);
    expect(employeeStatus.supervisorSigned).toBe(false);
  });

  it('200 - Gets Approved timesheet status', async () => {
    const employeeStatus = await expectStatus(TimesheetStatus.Approved);

    expect(employeeStatus.employeeSigned).toBe(true);
    expect(employeeStatus.supervisorSigned).toBe(true);
  });

  it('200 - Gets Complete timesheet status', async () => {
    const employeeStatus = await expectStatus(TimesheetStatus.Complete);

    expect(employeeStatus.employeeSigned).toBe(true);
    expect(employeeStatus.supervisorSigned).toBe(true);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/timesheet/status/${missingClientId}/${payPeriodId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/timesheet/status/${client.clientId}/${missingPayPeriodId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
