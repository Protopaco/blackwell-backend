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
    status: 'Open',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  emptySnapshot: {
    employees: [],
    activities: [],
    fundingSources: [],
    holidays: [],
    settings: { timeInputMethod: 'ClockInOut', payPeriodInterval: 'Bi-Weekly', payPeriodStartDate: '2026-01-05' },
  } as PayPeriodConfigSnapshot,
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn().mockResolvedValue({ client, payPeriod }) }));
vi.mock('#db/payrollReport/readPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue(emptySnapshot) }));

import generatePayrollReport from '#services/payrollReport/generatePayrollReport.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';

describe('generatePayrollReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue(emptySnapshot);
  });

  it('reads the config snapshot from the pay period\'s report workbook, not client-wide PayrollConfig', async () => {
    await expect(generatePayrollReport('c1', 'p1')).rejects.toThrow();

    expect(readPayPeriodConfigSnapshot).toHaveBeenCalledWith('report-1');
  });
});
