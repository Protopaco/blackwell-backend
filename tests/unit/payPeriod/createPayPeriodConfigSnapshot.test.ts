import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import PayrollConfig from '#models/PayrollConfig.js';

const { payrollConfig } = vi.hoisted(() => ({
  payrollConfig: {
    employees: [
      { employeeId: 'e1', status: 'Active' },
      { employeeId: 'e2', status: 'Inactive' },
    ],
    supervisors: [],
    activities: [{ activityId: 'a1' }],
    fundingSources: [{ fundingSourceId: 'fs1' }],
    holidays: [{ holidayId: 'h1' }],
    settings: { timeInputMethod: 'ClockInOut', payPeriodInterval: 'Bi-Weekly', payPeriodStartDate: '2026-01-05' },
    timesheetFolders: [],
  } as unknown as PayrollConfig,
}));

vi.mock('#db/adapter/createOAuthWorkbook.js', () => ({ default: vi.fn().mockResolvedValue('report-1') }));
vi.mock('#db/adapter/createTabsIfNotExists.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/payrollConfig/readPayrollConfig.js', () => ({ default: vi.fn().mockResolvedValue(payrollConfig) }));
vi.mock('#db/employee/writeEmployeesBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/activity/writeActivitiesBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/fundingSource/writeFundingSourcesBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/holiday/writeHolidaysBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/settings/writeSettings.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import createPayPeriodConfigSnapshot from '#services/payPeriod/createPayPeriodConfigSnapshot.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import createTabsIfNotExists from '#db/adapter/createTabsIfNotExists.js';
import writeEmployeesBulk from '#db/employee/writeEmployeesBulk.js';
import writeActivitiesBulk from '#db/activity/writeActivitiesBulk.js';
import writeFundingSourcesBulk from '#db/fundingSource/writeFundingSourcesBulk.js';
import writeHolidaysBulk from '#db/holiday/writeHolidaysBulk.js';
import writeSettings from '#db/settings/writeSettings.js';

const client: Client = {
  clientId: 'c1',
  clientName: 'Acme Co',
  clientCode: 'ACME',
  status: 'Active',
  employeePayrollFolderId: 'epf-1',
  payrollConfigFolderId: 'pcf-1',
  payrollReportFolderId: 'prf-1',
  payrollConfigFileId: 'config-1',
  payPeriodRegistryFileId: 'registry-1',
};

const payPeriod: PayPeriod = {
  payPeriodId: 'p1',
  payPeriodName: '06/01 - 06/14',
  status: 'Pending',
  startDate: '2026-06-01',
  endDate: '2026-06-14',
  createdDate: '2026-05-28',
  payrollReportFileId: '',
};

describe('createPayPeriodConfigSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates the report workbook named after the pay period, in the client\'s report folder', async () => {
    await createPayPeriodConfigSnapshot(client, payPeriod);

    expect(createOAuthWorkbook).toHaveBeenCalledWith('06/01 - 06/14', 'prf-1');
  });

  it('provisions all five snapshot tabs on the new workbook', async () => {
    await createPayPeriodConfigSnapshot(client, payPeriod);

    expect(createTabsIfNotExists).toHaveBeenCalledWith('report-1', [
      'Employees', 'Activities', 'FundingSources', 'Holidays', 'Settings',
    ]);
  });

  it('writes only Active employees to the Employees tab', async () => {
    await createPayPeriodConfigSnapshot(client, payPeriod);

    expect(writeEmployeesBulk).toHaveBeenCalledWith('report-1', [{ employeeId: 'e1', status: 'Active' }]);
  });

  it('writes activities, funding sources, holidays, and settings unfiltered', async () => {
    await createPayPeriodConfigSnapshot(client, payPeriod);

    expect(writeActivitiesBulk).toHaveBeenCalledWith('report-1', payrollConfig.activities);
    expect(writeFundingSourcesBulk).toHaveBeenCalledWith('report-1', payrollConfig.fundingSources);
    expect(writeHolidaysBulk).toHaveBeenCalledWith('report-1', payrollConfig.holidays);
    expect(writeSettings).toHaveBeenCalledWith('report-1', payrollConfig.settings);
  });

  it('returns the new report workbook file ID', async () => {
    const reportFileId = await createPayPeriodConfigSnapshot(client, payPeriod);

    expect(reportFileId).toBe('report-1');
  });
});
