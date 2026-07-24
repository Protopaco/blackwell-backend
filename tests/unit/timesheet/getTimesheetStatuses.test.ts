import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayPeriod from '#models/PayPeriod.js';
import PayPeriodConfigSnapshot from '#models/PayPeriodConfigSnapshot.js';

const { payPeriod, emptySnapshot } = vi.hoisted(() => ({
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

vi.mock('#services/payPeriod/getPayPeriodById.js', () => ({ default: vi.fn().mockResolvedValue(payPeriod) }));
vi.mock('#db/payrollReport/readPayPeriodConfigSnapshot.js', () => ({ default: vi.fn().mockResolvedValue(emptySnapshot) }));
vi.mock('#db/payrollReport/readCurrentHoursTab.js', () => ({ default: vi.fn().mockResolvedValue([]) }));

import getTimesheetStatuses from '#services/timesheet/getTimesheetStatuses.js';
import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';

describe('getTimesheetStatuses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readPayPeriodConfigSnapshot).mockResolvedValue(emptySnapshot);
  });

  it('gets employees from the pay period\'s config snapshot instead of the live client-wide employee list', async () => {
    const statuses = await getTimesheetStatuses('c1', 'p1');

    expect(readPayPeriodConfigSnapshot).toHaveBeenCalledWith('report-1');
    expect(statuses).toEqual([]);
  });
});
