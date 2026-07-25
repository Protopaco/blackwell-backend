import { describe, it, expect, vi } from 'vitest';
import Employee from '#models/Employee.js';

vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeEmployeesBulk from '#db/employee/writeEmployeesBulk.js';
import writeValues from '#db/adapter/writeValues.js';

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

describe('writeEmployeesBulk', () => {
  it('writes a header row plus one row per employee', async () => {
    await writeEmployeesBulk('report-1', [employee]);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Employees', [
      [
        'EmployeeId', 'FirstName', 'LastName', 'Position',
        'HourlyPayRate1', 'HourlyPayRate2', 'HolidayPayRate',
        'Email', 'Status', 'TimesheetFileId',
      ],
      ['e1', 'Jane', 'Smith', 'Coordinator', 20, 25, 30, 'jane@example.com', 'Active', 'file-1'],
    ]);
  });

  it('still writes just the header row when there are no employees', async () => {
    await writeEmployeesBulk('report-1', []);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'Employees', [
      [
        'EmployeeId', 'FirstName', 'LastName', 'Position',
        'HourlyPayRate1', 'HourlyPayRate2', 'HolidayPayRate',
        'Email', 'Status', 'TimesheetFileId',
      ],
    ]);
  });
});
