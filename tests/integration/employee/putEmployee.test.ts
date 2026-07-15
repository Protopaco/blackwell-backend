import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import Employee from '#models/Employee.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import createTestClient from '../builders/createTestClient.js';
import createTestEmployee from '../builders/createTestEmployee.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/employee/:clientId/:employeeId', () => {
  it('200 - Updates employee', async () => {
    const client = await createTestClient();
    const employee = await createTestEmployee(client.clientId);
    const uniqueCode = getUniqueCode('UPDEMP');
    const updatedEmployee = {
      ...employee,
      employeeId: crypto.randomUUID(),
      firstName: 'Updated',
      lastName: `Employee ${uniqueCode}`,
      position: 'Lead Caregiver',
      hourlyPayRate1: 31,
      hourlyPayRate2: 36,
      holidayPayRate: 45,
      email: `updated.employee.${uniqueCode.toLowerCase()}@example.com`,
      status: EmployeeStatus.Inactive,
    };

    const res = await request(app)
      .put(`/api/v1/employee/${client.clientId}/${employee.employeeId}`)
      .send(updatedEmployee);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Employee updated');

    const employeesRes = await request(app).get(`/api/v1/employee/${client.clientId}`);
    expect(employeesRes.status).toBe(200);

    const persistedEmployee = employeesRes.body.find(
      (candidate: Employee) => candidate.employeeId === employee.employeeId,
    );
    expect(persistedEmployee).toMatchObject({
      employeeId: employee.employeeId,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      position: updatedEmployee.position,
      hourlyPayRate1: updatedEmployee.hourlyPayRate1,
      hourlyPayRate2: updatedEmployee.hourlyPayRate2,
      holidayPayRate: updatedEmployee.holidayPayRate,
      email: updatedEmployee.email,
      status: updatedEmployee.status,
      timesheetFileId: employee.timesheetFileId,
    });
  });

  it('404 - Client not found', async () => {
    const client = await createTestClient();
    const employee = await createTestEmployee(client.clientId);
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/employee/${missingClientId}/${employee.employeeId}`)
      .send(employee);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Employee not found', async () => {
    const client = await createTestClient();
    const employee = await createTestEmployee(client.clientId);
    const missingEmployeeId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/employee/${client.clientId}/${missingEmployeeId}`)
      .send(employee);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Employee not found: ${missingEmployeeId}`);
  });
});
