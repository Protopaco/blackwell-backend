import { describe, it, expect, vi, beforeEach } from 'vitest';
import Employee from '#models/Employee.js';

const { testClient, employee, payrollConfig } = vi.hoisted(() => ({
  testClient: { payrollConfigFileId: 'config-1' } as any,
  employee: {
    employeeId: 'e1',
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'Coordinator',
    salaryAmount: 2000,
    activityRates: [{ activityId: 'a1', payRateType: 'Hourly', payRate: 20, holidayPayRate: 25 }],
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('throws UnprocessableError when an Active employee has no activityRates', async () => {
    await expect(
      updateEmployee('client-1', { ...employee, activityRates: [] }),
    ).rejects.toThrow('Active employee must have at least one activity: Jane Smith');

    expect(reconcileEmployeeActivityRates).not.toHaveBeenCalled();
  });

  it('does not require activityRates for an Inactive employee', async () => {
    await updateEmployee('client-1', { ...employee, status: 'Inactive', activityRates: [] });

    expect(writeEmployees).toHaveBeenCalledWith(
      'config-1',
      expect.objectContaining({ status: 'Inactive' }),
    );
  });
});
