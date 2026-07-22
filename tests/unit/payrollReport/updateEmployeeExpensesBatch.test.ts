import { describe, it, expect, vi, beforeEach } from 'vitest';

const { testPayPeriod, testClient } = vi.hoisted(() => ({
  testPayPeriod: { payrollReportFileId: 'report-1' } as any,
  testClient: { payrollConfigFileId: 'config-1' } as any,
}));

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn().mockResolvedValue(testPayPeriod) }));
vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn().mockResolvedValue(testClient) }));
vi.mock('#db/payrollReport/readEmployeeExpensesTab.js', () => ({ default: vi.fn() }));
vi.mock('#db/payrollReport/writeEmployeeExpensesTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import updateEmployeeExpensesBatch from '#services/payrollReport/updateEmployeeExpensesBatch.js';
import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import getClientById from '#services/client/getClientById.js';
import readEmployeeExpensesTab from '#db/payrollReport/readEmployeeExpensesTab.js';
import writeEmployeeExpensesTab from '#db/payrollReport/writeEmployeeExpensesTab.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';

describe('updateEmployeeExpensesBatch', () => {
  beforeEach(() => {
    vi.mocked(getPayPeriodById).mockResolvedValue(testPayPeriod);
    vi.mocked(getClientById).mockResolvedValue(testClient);
    vi.mocked(readEmployeeExpensesTab).mockResolvedValue([]);
    vi.mocked(writeEmployeeExpensesTab).mockClear();
    payrollConfigCache.set('config-1', {
      employees: [
        { employeeId: 'e1', firstName: 'Jane', lastName: 'Smith' },
        { employeeId: 'e2', firstName: 'John', lastName: 'Doe' },
      ],
    } as any);
  });

  it('overlays totalExpense onto an employee that already has an EmployeeExpense record', async () => {
    vi.mocked(readEmployeeExpensesTab).mockResolvedValue([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 },
    ]);

    await updateEmployeeExpensesBatch('client-1', 'pp-1', [{ employeeId: 'e1', totalExpense: 250 }]);

    expect(getClientById).not.toHaveBeenCalled();
    expect(writeEmployeeExpensesTab).toHaveBeenCalledWith('report-1', [
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 250 },
    ]);
  });

  it('creates a new EmployeeExpense record for an employee with no existing record', async () => {
    await updateEmployeeExpensesBatch('client-1', 'pp-1', [{ employeeId: 'e2', totalExpense: 75 }]);

    expect(writeEmployeeExpensesTab).toHaveBeenCalledWith('report-1', [
      { employeeId: 'e2', employeeName: 'John Doe', totalExpense: 75 },
    ]);
  });

  it('handles a mix of overlay and create in the same batch', async () => {
    vi.mocked(readEmployeeExpensesTab).mockResolvedValue([
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 100 },
    ]);

    await updateEmployeeExpensesBatch('client-1', 'pp-1', [
      { employeeId: 'e1', totalExpense: 200 },
      { employeeId: 'e2', totalExpense: 50 },
    ]);

    expect(writeEmployeeExpensesTab).toHaveBeenCalledWith('report-1', [
      { employeeId: 'e1', employeeName: 'Jane Smith', totalExpense: 200 },
      { employeeId: 'e2', employeeName: 'John Doe', totalExpense: 50 },
    ]);
  });

  it('rejects the whole batch with a 422-mapped error when an employeeId is unknown to PayrollConfig', async () => {
    await expect(
      updateEmployeeExpensesBatch('client-1', 'pp-1', [{ employeeId: 'unknown', totalExpense: 999 }]),
    ).rejects.toThrow('Unknown employeeId(s) in employeeExpenses batch: unknown');

    expect(writeEmployeeExpensesTab).not.toHaveBeenCalled();
  });

  it('names every offending id when multiple employeeIds are unknown', async () => {
    await expect(
      updateEmployeeExpensesBatch('client-1', 'pp-1', [
        { employeeId: 'unknown-1', totalExpense: 1 },
        { employeeId: 'unknown-2', totalExpense: 2 },
      ]),
    ).rejects.toThrow('Unknown employeeId(s) in employeeExpenses batch: unknown-1, unknown-2');
  });

  it('throws NotFoundError when the client does not exist', async () => {
    vi.mocked(getClientById).mockResolvedValueOnce(null);

    await expect(
      updateEmployeeExpensesBatch('client-1', 'pp-1', [{ employeeId: 'e2', totalExpense: 50 }]),
    ).rejects.toThrow('Client not found: client-1');
  });

  it('throws NotFoundError when the pay period has no payroll report file', async () => {
    vi.mocked(getPayPeriodById).mockResolvedValueOnce({ payrollReportFileId: '' } as any);

    await expect(
      updateEmployeeExpensesBatch('client-1', 'pp-1', [{ employeeId: 'e1', totalExpense: 50 }]),
    ).rejects.toThrow('No payroll report file exists for pay period: pp-1');
  });
});
