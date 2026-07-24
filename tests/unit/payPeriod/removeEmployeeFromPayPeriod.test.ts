import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import Employee from '#models/Employee.js';

const { payPeriod, activeEmployee } = vi.hoisted(() => ({
  payPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Open',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  activeEmployee: {
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

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn().mockResolvedValue(payPeriod) }));
vi.mock('#db/employee/readEmployeeById.js', () => ({ default: vi.fn().mockResolvedValue(activeEmployee) }));
vi.mock('#db/employee/writeEmployees.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/tabExists.js', () => ({ default: vi.fn().mockResolvedValue(false) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import removeEmployeeFromPayPeriod from '#services/payPeriod/removeEmployeeFromPayPeriod.js';
import readEmployeeById from '#db/employee/readEmployeeById.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import tabExists from '#db/adapter/tabExists.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('removeEmployeeFromPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readEmployeeById).mockResolvedValue(activeEmployee);
    vi.mocked(tabExists).mockResolvedValue(false);
  });

  it('flips the snapshot row to Inactive and invalidates the cache when no timesheet exists yet', async () => {
    await removeEmployeeFromPayPeriod('c1', 'p1', 'e1');

    expect(tabExists).toHaveBeenCalledWith('file-1', '06/01 - 06/14');
    expect(writeEmployees).toHaveBeenCalledWith('report-1', { ...activeEmployee, status: 'Inactive' });
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('throws and does not write when a timesheet has already been generated', async () => {
    vi.mocked(tabExists).mockResolvedValueOnce(true);

    await expect(removeEmployeeFromPayPeriod('c1', 'p1', 'e1')).rejects.toThrow('already been generated');
    expect(writeEmployees).not.toHaveBeenCalled();
  });

  it('throws when the employee is not found on this pay period', async () => {
    vi.mocked(readEmployeeById).mockResolvedValueOnce(null);

    await expect(removeEmployeeFromPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Employee not found on this pay period: unknown');
  });

  it('throws when the employee is already Inactive on this pay period', async () => {
    vi.mocked(readEmployeeById).mockResolvedValueOnce({ ...activeEmployee, status: 'Inactive' });

    await expect(removeEmployeeFromPayPeriod('c1', 'p1', 'e1')).rejects.toThrow('Employee not found on this pay period: e1');
  });
});
