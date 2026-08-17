import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import Employee from '#models/Employee.js';
import PayPeriod from '#models/PayPeriod.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';
import TimesheetDetail from '#models/TimesheetDetail.js';
import TimesheetEntry from '#models/TimesheetEntry.js';

const { client, payPeriod, emptySnapshot, salariedEmployee } = vi.hoisted(() => ({
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
  emptySnapshot: {
    employees: [],
    activities: [],
    employeeActivityRates: [],
    fundingSources: [],
    holidays: [],
    settings: { timeInputMethod: 'ClockInOut', payPeriodInterval: 'Bi-Weekly', payPeriodStartDate: '2026-01-05' },
  } as PayPeriodConfigSnapshot,
  salariedEmployee: {
    employeeId: 'e1',
    firstName: 'Jane',
    lastName: 'Smith',
    position: 'Coordinator',
    salaryAmount: 2000,
    activityRates: [{ activityId: 'a1', payRateType: 'Salary', payRate: 0, holidayPayRate: 0 }],
    email: 'jane@example.com',
    status: 'Active',
    timesheetFileId: 'timesheet-1',
  } as Employee,
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue({ client, payPeriod }) }));
vi.mock('#db/payrollReport/readPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue(emptySnapshot) }));
vi.mock('#services/timesheet/readTimesheetDetail.js', () => ({
  default: vi.fn().mockResolvedValue({
    totalHours: 8,
    flatRateQuantity: null,
    employeeSigned: true,
    supervisorSigned: true,
    includeInPayroll: true,
  } as TimesheetDetail),
}));
vi.mock('#services/timesheet/readTimesheetEntries.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/adapter/createOAuthWorkbook.js', () => ({ default: vi.fn().mockResolvedValue('report-1') }));
vi.mock('#db/adapter/renameTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/adapter/listTabNames.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/adapter/reorderTabs.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payrollReport/archivePayrollReportTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payrollReport/writePayrollReportTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payPeriod/writePayPeriod.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import generatePayrollReport from '#services/payrollReport/generatePayrollReport.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';
import readTimesheetEntries from '#services/timesheet/readTimesheetEntries.js';

describe('generatePayrollReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue(emptySnapshot);
  });

  it('reads the config snapshot from the pay period\'s report workbook, not client-wide PayrollConfig', async () => {
    await expect(generatePayrollReport('c1', 'p1')).rejects.toThrow();

    expect(readPayPeriodConfigSnapshot).toHaveBeenCalledWith('report-1');
  });

  it('throws UnprocessableError when a salaried employee has zero hours logged against salary-type activities', async () => {
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue({
      ...emptySnapshot,
      employees: [salariedEmployee],
      activities: [{ activityId: 'a1', activityName: 'Programs', trackSeparately: false, payrollCategory: 'Regular', groupLabel: null, sortOrder: 0, fundingSources: [] }],
    });
    vi.mocked(readTimesheetEntries).mockResolvedValue([]);

    await expect(generatePayrollReport('c1', 'p1')).rejects.toThrow(
      'Jane Smith is salaried but has zero hours logged against salary-type activities this pay period',
    );
  });

  it('does not throw the zero-salary-hours error when the salaried employee has salary-type hours logged', async () => {
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue({
      ...emptySnapshot,
      employees: [salariedEmployee],
      activities: [{ activityId: 'a1', activityName: 'Programs', trackSeparately: false, payrollCategory: 'Regular', groupLabel: null, sortOrder: 0, fundingSources: [] }],
    });
    vi.mocked(readTimesheetEntries).mockResolvedValue([
      {
        employeeId: 'e1',
        employeeName: 'Jane Smith',
        activityId: 'a1',
        activityName: 'Programs',
        payrollCategory: 'Regular',
        payRateType: 'Salary',
        date: '2026-06-02',
        isHoliday: false,
        hours: 8,
      } as TimesheetEntry,
    ]);

    await expect(generatePayrollReport('c1', 'p1')).resolves.toBeUndefined();
  });
});
