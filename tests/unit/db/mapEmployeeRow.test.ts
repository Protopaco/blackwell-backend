import { describe, it, expect } from 'vitest';
import mapEmployeeRow from '#db/employee/mapEmployeeRow.js';
import Employee from '#models/Employee.js';

const employee: Employee = {
  employeeId: 'e1',
  firstName: 'Jane',
  lastName: 'Smith',
  position: 'Coordinator',
  salaryAmount: 2000,
  activityRates: [],
  email: 'jane@example.com',
  status: 'Active',
  timesheetFileId: 'file-1',
};

describe('mapEmployeeRow', () => {
  it('maps an Employee to a row object keyed by EMPLOYEES_HEADERS, including Status', () => {
    expect(mapEmployeeRow(employee)).toEqual({
      EmployeeId: 'e1',
      FirstName: 'Jane',
      LastName: 'Smith',
      Position: 'Coordinator',
      SalaryAmount: 2000,
      Email: 'jane@example.com',
      Status: 'Active',
      TimesheetFileId: 'file-1',
    });
  });
});
