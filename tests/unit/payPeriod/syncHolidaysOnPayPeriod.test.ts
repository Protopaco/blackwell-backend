import { describe, it, expect, vi, beforeEach } from 'vitest';
import Client from '#models/Client.js';
import PayPeriod from '#models/PayPeriod.js';
import Holiday from '#models/Holiday.js';

const { client, pendingPayPeriod, openPayPeriod, payrollConfigHolidays } = vi.hoisted(() => ({
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
  pendingPayPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Pending',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  openPayPeriod: {
    payPeriodId: 'p1',
    payPeriodName: '06/01 - 06/14',
    status: 'Open',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    createdDate: '2026-05-28',
    payrollReportFileId: 'report-1',
  } as PayPeriod,
  payrollConfigHolidays: [
    { holidayId: 'h1', holidayName: 'Mid-period holiday', holidayDate: '2026-06-10' },
    { holidayId: 'h2', holidayName: 'Independence Day', holidayDate: '2026-07-04' },
    { holidayId: 'h3', holidayName: 'Start-of-period boundary', holidayDate: '2026-06-01' },
  ] as Holiday[],
}));

vi.mock('#services/payPeriod/getClientAndPayPeriod.js', () => ({ default: vi.fn() }));
vi.mock('#db/holiday/readHolidays.js', () => ({ default: vi.fn().mockResolvedValue(payrollConfigHolidays) }));
vi.mock('#db/holiday/writeHolidaysBulk.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({ default: { delete: vi.fn() } }));

import syncHolidaysOnPayPeriod from '#services/payPeriod/syncHolidaysOnPayPeriod.js';
import getClientAndPayPeriod from '#services/payPeriod/getClientAndPayPeriod.js';
import readHolidays from '#db/holiday/readHolidays.js';
import writeHolidaysBulk from '#db/holiday/writeHolidaysBulk.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('syncHolidaysOnPayPeriod', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: pendingPayPeriod });
    vi.mocked(readHolidays).mockResolvedValue(payrollConfigHolidays);
  });

  it('overwrites the snapshot with only holidays whose date falls within the pay period range', async () => {
    await syncHolidaysOnPayPeriod('c1', 'p1');

    expect(readHolidays).toHaveBeenCalledWith('config-1');
    expect(writeHolidaysBulk).toHaveBeenCalledWith('report-1', [
      { holidayId: 'h1', holidayName: 'Mid-period holiday', holidayDate: '2026-06-10' },
      { holidayId: 'h3', holidayName: 'Start-of-period boundary', holidayDate: '2026-06-01' },
    ]);
    expect(payPeriodConfigSnapshotCache.delete).toHaveBeenCalledWith('report-1');
  });

  it('writes an empty list when no PayrollConfig holidays fall within range', async () => {
    vi.mocked(readHolidays).mockResolvedValue([payrollConfigHolidays[1]]);

    await syncHolidaysOnPayPeriod('c1', 'p1');

    expect(writeHolidaysBulk).toHaveBeenCalledWith('report-1', []);
  });

  it('throws and does not write when a timesheet has already been generated', async () => {
    vi.mocked(getClientAndPayPeriod).mockResolvedValue({ client, payPeriod: openPayPeriod });

    await expect(syncHolidaysOnPayPeriod('c1', 'p1')).rejects.toThrow('already been generated');
    expect(writeHolidaysBulk).not.toHaveBeenCalled();
  });
});
