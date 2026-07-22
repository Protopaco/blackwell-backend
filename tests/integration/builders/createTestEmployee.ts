import request from 'supertest';
import app from '#app.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import Employee from '#models/Employee.js';
import EmployeeCreateRequest from '#models/EmployeeCreateRequest.js';
import { EmployeeStatus } from '#models/EmployeeStatus.js';
import getClientById from '../helpers/getClientById.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestEmployee = async (
  clientId: string,
  overrides: Partial<EmployeeCreateRequest> = {},
): Promise<Employee> => {
  const client = await getClientById(clientId);
  const uniqueCode = getUniqueCode('EMP');
  const timesheetFileLink =
    overrides.timesheetFileLink ??
    (overrides.timesheetFolderId
      ? undefined
      : `https://docs.google.com/spreadsheets/d/${await createOAuthWorkbook(
          `Test Employee ${uniqueCode} Timesheet`,
          client.employeePayrollFolderId,
        )}/edit`);

  const requestBody: EmployeeCreateRequest = {
    firstName: 'Test',
    lastName: `Employee ${uniqueCode}`,
    position: 'Caregiver',
    hourlyPayRate1: 20,
    hourlyPayRate2: 25,
    holidayPayRate: 30,
    email: `test.employee.${uniqueCode.toLowerCase()}@example.com`,
    status: EmployeeStatus.Active,
    timesheetFileLink,
    ...overrides,
  };

  const response = await request(app).post(`/api/v1/employee/${clientId}`).send(requestBody);
  if (response.status !== 201) {
    throw new Error(
      `createTestEmployee failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  const employeesResponse = await request(app).get(`/api/v1/employee/${clientId}`);
  if (employeesResponse.status !== 200) {
    throw new Error(
      `createTestEmployee employee lookup failed: ${employeesResponse.status} ${JSON.stringify(employeesResponse.body)}`,
    );
  }

  const employee = employeesResponse.body.find(
    (candidate: Employee) => candidate.email === requestBody.email,
  );
  if (!employee) throw new Error(`createTestEmployee employee not found: ${requestBody.email}`);

  return employee;
};

export default createTestEmployee;
