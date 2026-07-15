import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import appendEmployee from '#db/employee/appendEmployee.js';
import listTabNames from '#db/adapter/listTabNames.js';
import readManifest from '#db/manifest/readManifest.js';
import tabExists from '#db/adapter/tabExists.js';
import Employee from '#models/Employee.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { PayPeriodStatus } from '#models/PayPeriodStatus.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import createTestActivity from '../builders/createTestActivity.js';
import createTestClient from '../builders/createTestClient.js';
import createTestEmployee from '../builders/createTestEmployee.js';
import createTestPayPeriod from '../builders/createTestPayPeriod.js';
import createTestTimesheetFolder from '../builders/createTestTimesheetFolder.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTimesheetGenerationState = async () => {
  const client = await createTestClient();
  const timesheetFolder = await createTestTimesheetFolder(client);
  const employee = await createTestEmployee(client.clientId, {
    timesheetFolderId: timesheetFolder.timesheetFolderId,
  });
  await createTestActivity(client.clientId);
  const payPeriod = await createTestPayPeriod(client.clientId);

  return { client, employee, payPeriod };
};

const getPayPeriodById = async (
  clientId: string,
  payPeriodId: string,
): Promise<PayPeriodResponse | undefined> => {
  const response = await request(app).get(`/api/v1/payPeriod/${clientId}`);
  expect(response.status).toBe(200);
  return response.body.find(
    (candidate: PayPeriodResponse) => candidate.payPeriodId === payPeriodId,
  );
};

describe('POST /api/v1/timesheet/:clientId/:payPeriodId/generate', () => {
  it('200 - Generates timesheets', async () => {
    const { client, employee, payPeriod } = await createTimesheetGenerationState();

    const res = await request(app).post(
      `/api/v1/timesheet/${client.clientId}/${payPeriod.payPeriodId}/generate`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Timesheets generated');
    await expect(tabExists(employee.timesheetFileId, payPeriod.payPeriodName)).resolves.toBe(true);

    const manifest = await readManifest(employee.timesheetFileId, payPeriod.payPeriodName);
    expect(manifest).toMatchObject({
      payPeriodId: payPeriod.payPeriodId,
      employeeId: employee.employeeId,
      tabName: payPeriod.payPeriodName,
    });

    const updatedPayPeriod = await getPayPeriodById(client.clientId, payPeriod.payPeriodId);
    expect(updatedPayPeriod?.status).toBe(PayPeriodStatus.Open);
  });

  it('200 - Skips existing timesheet tab', async () => {
    const { client, employee, payPeriod } = await createTimesheetGenerationState();
    const url = `/api/v1/timesheet/${client.clientId}/${payPeriod.payPeriodId}/generate`;

    const firstRes = await request(app).post(url);
    expect(firstRes.status).toBe(200);
    const tabNamesAfterFirstGenerate = await listTabNames(employee.timesheetFileId);

    const secondRes = await request(app).post(url);
    expect(secondRes.status).toBe(200);
    expect(secondRes.body.message).toBe('Timesheets generated');
    const tabNamesAfterSecondGenerate = await listTabNames(employee.timesheetFileId);

    expect(
      tabNamesAfterSecondGenerate.filter((tabName) => tabName === payPeriod.payPeriodName),
    ).toHaveLength(1);
    expect(tabNamesAfterSecondGenerate).toEqual(tabNamesAfterFirstGenerate);
  });

  it('422 - Active employee missing timesheetFileId', async () => {
    const client = await createTestClient();
    await createTestActivity(client.clientId);
    const payPeriod = await createTestPayPeriod(client.clientId);
    const uniqueCode = getUniqueCode('EMP');
    const employee: Employee = {
      employeeId: crypto.randomUUID(),
      firstName: 'Missing',
      lastName: `Timesheet ${uniqueCode}`,
      position: 'Caregiver',
      hourlyPayRate1: 20,
      hourlyPayRate2: 25,
      holidayPayRate: 30,
      email: `missing.timesheet.${uniqueCode.toLowerCase()}@example.com`,
      status: EmployeeStatus.Active,
      timesheetFileId: '',
    };
    await appendEmployee(client.payrollConfigFileId, employee);
    payrollConfigCache.delete(client.payrollConfigFileId);

    const res = await request(app).post(
      `/api/v1/timesheet/${client.clientId}/${payPeriod.payPeriodId}/generate`,
    );

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Active employees missing a timesheetFileId');
    expect(res.body.message).toContain(`${employee.firstName} ${employee.lastName}`);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const payPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/timesheet/${missingClientId}/${payPeriodId}/generate`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Pay period not found', async () => {
    const client = await createTestClient();
    const missingPayPeriodId = crypto.randomUUID();

    const res = await request(app).post(
      `/api/v1/timesheet/${client.clientId}/${missingPayPeriodId}/generate`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Pay period not found: ${missingPayPeriodId}`);
  });
});
