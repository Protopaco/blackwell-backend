import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import Employee from '#models/Employee.js';

const { client, payPeriod, activeEmployee } = vi.hoisted(() => ({
  client: {
    clientId: 'c1',
    clientName: 'Acme Co',
    clientCode: 'ACME',
    status: 'Active',
    employeePayrollFolderId: 'epf-1',
    payrollConfigFolderId: 'pcf-1',
    payrollReportFolderId: 'prf-1',
    payrollConfigFileId: 'config-1',
    payPeriodRegistryFileId: 'registry-1',
  } as Client,
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

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue({ client, payPeriod }) }));
vi.mock('#db/employee/readEmployeeById.js', () => ({ default: vi.fn() }));
vi.mock('#db/employee/appendEmployee.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/employee/writeEmployees.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import addEmployeeToPayPeriod from '#services/payPeriod/addEmployeeToPayPeriod.js';
import readEmployeeById from '#db/employee/readEmployeeById.js';
import appendEmployee from '#db/employee/appendEmployee.js';
import writeEmployees from '#db/employee/writeEmployees.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('addEmployeeToPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('appends the PayrollConfig employee to the snapshot when not already present, then invalidates the cache', async () => {
    vi.mocked(readEmployeeById)
      .mockResolvedValueOnce(activeEmployee) // PayrollConfig lookup
      .mockResolvedValueOnce(null); // snapshot lookup

    await addEmployeeToPayPeriod('c1', 'p1', 'e1');

    expect(readEmployeeById).toHaveBeenNthCalledWith(1, 'config-1', 'e1');
    expect(readEmployeeById).toHaveBeenNthCalledWith(2, 'report-1', 'e1');
    expect(appendEmployee).toHaveBeenCalledWith('report-1', activeEmployee);
    expect(writeEmployees).not.toHaveBeenCalled();
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('reactivates a previously-removed (Inactive) snapshot row instead of appending a duplicate', async () => {
    vi.mocked(readEmployeeById)
      .mockResolvedValueOnce(activeEmployee)
      .mockResolvedValueOnce({ ...activeEmployee, status: 'Inactive' });

    await addEmployeeToPayPeriod('c1', 'p1', 'e1');

    expect(writeEmployees).toHaveBeenCalledWith('report-1', activeEmployee);
    expect(appendEmployee).not.toHaveBeenCalled();
  });

  it('throws when the employee is already Active on this pay period', async () => {
    vi.mocked(readEmployeeById)
      .mockResolvedValueOnce(activeEmployee)
      .mockResolvedValueOnce(activeEmployee);

    await expect(addEmployeeToPayPeriod('c1', 'p1', 'e1')).rejects.toThrow('already on this pay period');
    expect(appendEmployee).not.toHaveBeenCalled();
    expect(writeEmployees).not.toHaveBeenCalled();
  });

  it('throws when the employee is not found in PayrollConfig', async () => {
    vi.mocked(readEmployeeById).mockResolvedValueOnce(null);

    await expect(addEmployeeToPayPeriod('c1', 'p1', 'unknown')).rejects.toThrow('Employee not found: unknown');
  });

  it('throws when the employee is not Active in PayrollConfig', async () => {
    vi.mocked(readEmployeeById).mockResolvedValueOnce({ ...activeEmployee, status: 'Inactive' });

    await expect(addEmployeeToPayPeriod('c1', 'p1', 'e1')).rejects.toThrow('not Active in PayrollConfig');
  });
});
