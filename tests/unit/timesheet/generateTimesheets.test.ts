import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';

const { client, payPeriod, emptySnapshot } = vi.hoisted(() => ({
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
    status: 'Pending',
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
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue({ client, payPeriod }) }));
vi.mock('#db/payrollReport/readPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue(emptySnapshot) }));
vi.mock('#db/payPeriod/readPayPeriods.js', () => ({ default: vi.fn().mockResolvedValue([]) }));
vi.mock('#db/payPeriod/writePayPeriod.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import generateTimesheets from '#services/timesheet/generateTimesheets.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';

describe('generateTimesheets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue(emptySnapshot);
  });

  it('reads the config snapshot from the pay period\'s report workbook, not client-wide PayrollConfig', async () => {
    await generateTimesheets('c1', 'p1');

    expect(readPayPeriodConfigSnapshot).toHaveBeenCalledWith('report-1');
  });

  it('throws naming any Active employee with no EmployeeActivityRates bridge rows', async () => {
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValueOnce({
      ...emptySnapshot,
      employees: [
        {
          employeeId: 'e1',
          firstName: 'Jamie',
          lastName: 'Carter',
          position: 'Coordinator',
          salaryAmount: 0,
          activityRates: [],
          email: 'jamie@example.com',
          status: 'Active',
          timesheetFileId: 'file-1',
        },
      ],
    } as PayPeriodConfigSnapshot);

    await expect(generateTimesheets('c1', 'p1')).rejects.toThrow(
      'Active employees have no activities assigned — fix via Employee update before generating: Jamie Carter',
    );
  });
});
