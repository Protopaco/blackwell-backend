import { describe, it, expect, vi } from 'vitest';
import Employee from '#models/Employee.js';

const { testClient, employee, payrollConfig } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  employee: {
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
  payrollConfig: { employees: [], activities: [] } as any,
}));

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({ default: vi.fn().mockResolvedValue(payrollConfig) }));
vi.mock('#services/employee/reconcileEmployeeActivityRates.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/employee/writeEmployees.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateEmployee from '#services/employee/updateEmployee.js';
import getClientById from '#services/client/getClientById.js';
import reconcileEmployeeActivityRates from '#services/employee/reconcileEmployeeActivityRates.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateEmployee', () => {
  it('reconciles activityRates, writes the updated employee, and invalidates the cache', async () => {
    payrollConfigCache.set('config-1', { employees: [] } as any);

    await updateEmployee('client-1', employee);

    expect(reconcileEmployeeActivityRates).toHaveBeenCalledWith(
      'config-1',
      employee,
      employee.activityRates,
      payrollConfig.activities,
    );
    expect(writeEmployees).toHaveBeenCalledWith('config-1', employee);
    expect(payrollConfigCache.get('config-1')).toBeNull();
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(updateEmployee('unknown-client', employee)).rejects.toThrow('Client not found: unknown-client');
  });
});
