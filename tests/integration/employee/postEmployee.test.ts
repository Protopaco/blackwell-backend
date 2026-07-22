import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import Employee from '#models/Employee.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import createTestClient from '../builders/createTestClient.js';
import createTestTimesheetFolder from '../builders/createTestTimesheetFolder.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const buildEmployeeRequest = (overrides = {}) => {
  const uniqueCode = getUniqueCode('EMP');

  return {
    firstName: 'Test',
    lastName: `Employee ${uniqueCode}`,
    position: 'Caregiver',
    hourlyPayRate1: 20,
    hourlyPayRate2: 25,
    holidayPayRate: 30,
    email: `test.employee.${uniqueCode.toLowerCase()}@example.com`,
    status: EmployeeStatus.Active,
    ...overrides,
  };
};

const getEmployeeByEmail = async (clientId: string, email: string): Promise<Employee | undefined> => {
  const res = await request(app).get(`/api/v1/employee/${clientId}`);

  expect(res.status).toBe(200);
  return res.body.find((employee: Employee) => employee.email === email);
};

describe('POST /api/v1/employee/:clientId', () => {
  it('201 - Creates employee using active timesheet folder', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client);
    const employeeRequest = buildEmployeeRequest({
      timesheetFolderId: timesheetFolder.timesheetFolderId,
    });

    const res = await request(app).post(`/api/v1/employee/${client.clientId}`).send(employeeRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Employee created');

    const employee = await getEmployeeByEmail(client.clientId, employeeRequest.email);
    expect(employee).toMatchObject({
      firstName: employeeRequest.firstName,
      lastName: employeeRequest.lastName,
      email: employeeRequest.email,
      status: EmployeeStatus.Active,
    });
    expect(employee?.timesheetFileId).toBeDefined();
  });

  it('201 - Creates employee using existing timesheet file', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('TSFILE');
    const timesheetFileId = await createOAuthWorkbook(
      `Existing Timesheet ${uniqueCode}`,
      client.employeePayrollFolderId,
    );
    const employeeRequest = buildEmployeeRequest({
      timesheetFileLink: `https://docs.google.com/spreadsheets/d/${timesheetFileId}/edit`,
    });

    const res = await request(app).post(`/api/v1/employee/${client.clientId}`).send(employeeRequest);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Employee created');

    const employee = await getEmployeeByEmail(client.clientId, employeeRequest.email);
    expect(employee).toMatchObject({
      firstName: employeeRequest.firstName,
      lastName: employeeRequest.lastName,
      email: employeeRequest.email,
      timesheetFileId,
    });
  });

  it('422 - Missing timesheetFolderId and timesheetFileLink', async () => {
    const client = await createTestClient();
    const employeeRequest = buildEmployeeRequest();

    const res = await request(app).post(`/api/v1/employee/${client.clientId}`).send(employeeRequest);

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Either timesheetFileLink or timesheetFolderId is required');
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const employeeRequest = buildEmployeeRequest({
      timesheetFileLink: 'https://docs.google.com/spreadsheets/d/existing-timesheet-file-id/edit',
    });

    const res = await request(app).post(`/api/v1/employee/${missingClientId}`).send(employeeRequest);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Timesheet folder not found', async () => {
    const client = await createTestClient();
    const missingTimesheetFolderId = crypto.randomUUID();
    const employeeRequest = buildEmployeeRequest({ timesheetFolderId: missingTimesheetFolderId });

    const res = await request(app).post(`/api/v1/employee/${client.clientId}`).send(employeeRequest);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Active timesheet folder not found: ${missingTimesheetFolderId}`);
  });

  it('404 - Timesheet folder inactive', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client, {
      status: TimesheetFolderStatus.Inactive,
    });
    const employeeRequest = buildEmployeeRequest({
      timesheetFolderId: timesheetFolder.timesheetFolderId,
    });

    const res = await request(app).post(`/api/v1/employee/${client.clientId}`).send(employeeRequest);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(
      `Active timesheet folder not found: ${timesheetFolder.timesheetFolderId}`,
    );
  });
});
