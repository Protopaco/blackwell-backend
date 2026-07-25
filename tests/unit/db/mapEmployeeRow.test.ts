import { describe, it, expect } from 'vitest';
import mapEmployeeRow from '#db/employee/mapEmployeeRow.js';
import Employee from '#models/Employee.js';

const employee: Employee = {
  employeeId: 'e1',
  firstName: 'Jane',
  lastName: 'Smith',
  position: 'Coordinator',
  hourlyPayRate1: 20,
  hourlyPayRate2: 25,
  holidayPayRate: 30,
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
      HourlyPayRate1: 20,
      HourlyPayRate2: 25,
      HolidayPayRate: 30,
      Email: 'jane@example.com',
      Status: 'Active',
      TimesheetFileId: 'file-1',
    });
  });
});
