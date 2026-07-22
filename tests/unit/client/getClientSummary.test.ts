import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#services/client/getClientById.js', () => ({ default: vi.fn() }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({ default: vi.fn() }));
vi.mock('#services/payPeriod/getPayPeriods.js', () => ({ default: vi.fn() }));

import getClientSummary from '#services/client/getClientSummary.js';
import getClientById from '#services/client/getClientById.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getPayPeriods from '#services/payPeriod/getPayPeriods.js';

describe('getClientSummary', () => {
  const activeEmployee = {
    employeeId: 'employee-active',
    firstName: 'Active',
    lastName: 'Employee',
    position: 'Staff',
    hourlyPayRate1: 25,
    hourlyPayRate2: 30,
    holidayPayRate: 35,
    email: 'active@example.com',
    status: 'Active',
    timesheetFileId: 'timesheet-active',
  };
  const inactiveEmployee = {
    ...activeEmployee,
    employeeId: 'employee-inactive',
    firstName: 'Inactive',
    status: 'Inactive',
    timesheetFileId: 'timesheet-inactive',
  };
  const activeTimesheetFolder = {
    timesheetFolderId: 'timesheet-folder-active',
    timesheetFolderName: 'Main Office',
    driveFolderId: 'drive-active',
    status: 'Active',
  };
  const inactiveTimesheetFolder = {
    timesheetFolderId: 'timesheet-folder-inactive',
    timesheetFolderName: 'Old Office',
    driveFolderId: 'drive-inactive',
    status: 'Inactive',
  };
  const supervisor = {
    supervisorId: 'supervisor-1',
    firstName: 'Sue',
    lastName: 'Supervisor',
    email: 'sue@example.com',
  };
  const activity = {
    activityId: 'activity-1',
    activityName: 'Program',
    trackSeparately: true,
    payrollCategory: 'Regular',
    fundingSource1Name: 'Grant',
    fundingSource1Percentage: 100,
    fundingSource2Name: '',
    fundingSource2Percentage: 0,
    fundingSource3Name: '',
    fundingSource3Percentage: 0,
    payRate: 'HourlyPayRate1',
  };
  const fundingSource = {
    fundingSourceId: 'funding-source-1',
    fundingSourceName: 'Grant',
    fundingSourceCode: 'GRANT',
  };
  const holiday = {
    holidayId: 'holiday-1',
    holidayName: 'Holiday',
    holidayDate: '2026-01-01',
  };
  const settings = {
    timeInputMethod: 'TotalHours',
    payPeriodInterval: 'Bi-Weekly',
    payPeriodStartDate: '2026-01-05',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientById).mockResolvedValue({ payrollConfigFileId: 'config-1' } as any);
    vi.mocked(readPayrollConfig).mockResolvedValue({
      employees: [activeEmployee, inactiveEmployee],
      supervisors: [supervisor],
      activities: [activity],
      fundingSources: [fundingSource],
      holidays: [holiday],
      settings,
      timesheetFolders: [activeTimesheetFolder, inactiveTimesheetFolder],
    } as any);
    vi.mocked(getPayPeriods).mockResolvedValue([
      {
        payPeriodId: 'pay-period-open',
        payPeriodName: '01/05 - 01/18',
        status: 'Open',
        startDate: '2026-01-05',
        endDate: '2026-01-18',
        createdDate: '2026-01-01',
        payrollReportFileId: '',
      },
      {
        payPeriodId: 'pay-period-closed',
        payPeriodName: '12/22 - 01/04',
        status: 'Closed',
        startDate: '2025-12-22',
        endDate: '2026-01-04',
        createdDate: '2025-12-20',
        payrollReportFileId: 'report-closed',
      },
    ] as any);
  });

  it('returns active employees and active timesheet folders while preserving other config lists', async () => {
    const summary = await getClientSummary('client-1');

    expect(summary.employees).toEqual([activeEmployee]);
    expect(summary.timesheetFolders).toEqual([activeTimesheetFolder]);
    expect(summary.supervisors).toEqual([supervisor]);
    expect(summary.activities).toEqual([activity]);
    expect(summary.fundingSources).toEqual([fundingSource]);
    expect(summary.holidays).toEqual([holiday]);
    expect(summary.settings).toEqual(settings);
    expect(summary.payPeriods).toEqual([
      {
        payPeriodId: 'pay-period-open',
        payPeriodName: '01/05 - 01/18',
        status: 'Open',
        startDate: '2026-01-05',
        endDate: '2026-01-18',
        createdDate: '2026-01-01',
      },
    ]);
  });
});
