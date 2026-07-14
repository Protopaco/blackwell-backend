import { describe, it, expect, vi } from 'vitest';
import Employee from '#models/Employee.js';

const { testClient, employee } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  employee: {
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
  } as Employee,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/employee/writeEmployees.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateEmployee from '#services/employee/updateEmployee.js';
import getClientById from '#services/client/getClientById.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateEmployee', () => {
  it('writes the updated employee and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { employees: [] } as any);

    await updateEmployee('client-1', employee);

    expect(writeEmployees).toHaveBeenCalledWith('config-1', employee);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateEmployee('unknown-client', employee)).rejects.toThrow('Client not found: unknown-client');
  });
});
