import { describe, it, expect, vi } from 'vitest';
import Employee from '#models/Employee.js';

const { existingEmployee } = vi.hoisted(() => ({
  existingEmployee: {
    employeeId: 'e1',
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'Coordinator',
    salaryAmount: 2000,
    activityRates: [],
    email: 'jane@example.com',
    status: 'Active',
    timesheetFileId: 'file-1',
  } as Employee,
}));

vi.mock('#db/adapter/overwriteTabRows.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/employee/readEmployees.js', () => ({ default: vi.fn().mockResolvedValue([existingEmployee]) }));

import writeEmployees from '#db/employee/writeEmployees.js';
import overwriteTabRows from '#db/adapter/overwriteTabRows.js';

describe('writeEmployees', () => {
  it('writes the updated employee in place of the matching existing record', async () => {
    await writeEmployees('config-1', { ...existingEmployee, position: 'Manager' });

    expect(overwriteTabRows).toHaveBeenCalledWith(
      'config-1',
      'Employees',
      [
        'EmployeeId', 'FirstName', 'LastName', 'Position', 'SalaryAmount',
        'Email', 'Status', 'TimesheetFileId',
      ],
      [
        {
          EmployeeId: 'e1',
          FirstName: 'Jane',
          LastName: 'Smith',
          Position: 'Manager',
          SalaryAmount: 2000,
          Email: 'jane@example.com',
          Status: 'Active',
          TimesheetFileId: 'file-1',
        },
      ],
    );
  });

  it('throws NotFoundError when the employeeId does not match any existing employee', async () => {
    await expect(
      writeEmployees('config-1', { ...existingEmployee, employeeId: 'unknown' }),
    ).rejects.toThrow('Employee not found: unknown');
  });
});
