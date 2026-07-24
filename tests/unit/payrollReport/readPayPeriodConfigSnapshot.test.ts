import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('#db/adapter/readTabs.js', () => ({ default: vi.fn() }));
vi.mock('#utils/caches/payPeriodConfigSnapshotCache.js', () => ({
  default: { get: vi.fn().mockReturnValue(null), set: vi.fn() },
}));

import readPayPeriodConfigSnapshot from '#db/payrollReport/readPayPeriodConfigSnapshot.js';
import readTabs from '#db/adapter/readTabs.js';
import payPeriodConfigSnapshotCache from '#utils/caches/payPeriodConfigSnapshotCache.js';

describe('readPayPeriodConfigSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(payPeriodConfigSnapshotCache.get).mockReturnValue(null);
  });

  it('maps each batched tab to the correct field, in the order requested from readTabs', async () => {
    vi.mocked(readTabs).mockResolvedValue([
      [{ EmployeeId: 'e1', FirstName: 'Jane', LastName: 'Smith', Position: 'Coordinator', HourlyPayRate1: '20', HourlyPayRate2: '25', HolidayPayRate: '30', Email: 'jane@example.com', Status: 'Active', TimesheetFileId: 'file-1' }],
      [{ FundingSourceId: 'fs1', FundingSourceName: 'Federal Grant', FundingSourceCode: 'FG-100' }],
      [{ ActivityId: 'a1', ActivityName: 'Job Coaching', TrackSeparately: 'FALSE', PayrollCategory: 'Regular', PayRate: 'HourlyPayRate1', FlatRateAmount: '0' }],
      [{ TimesheetTemplate: 'ClockInOut', PayPeriodInterval: 'Bi-Weekly', PayPeriodStartDate: '2026-01-05' }],
      [{ HolidayId: 'h1', HolidayName: 'Labor Day', HolidayDate: '2026-09-07' }],
    ]);

    const snapshot = await readPayPeriodConfigSnapshot('report-1');

    expect(readTabs).toHaveBeenCalledWith('report-1', ['Employees', 'FundingSources', 'Activities', 'Settings', 'Holidays']);
    expect(snapshot.employees).toEqual([expect.objectContaining({ employeeId: 'e1' })]);
    expect(snapshot.fundingSources).toEqual([expect.objectContaining({ fundingSourceId: 'fs1' })]);
    expect(snapshot.activities).toEqual([expect.objectContaining({ activityId: 'a1' })]);
    expect(snapshot.holidays).toEqual([expect.objectContaining({ holidayId: 'h1' })]);
    expect(snapshot.settings).toEqual(expect.objectContaining({ timeInputMethod: 'ClockInOut' }));
  });

  it('returns the cached snapshot without calling readTabs when present', async () => {
    const cached = { employees: [], activities: [], fundingSources: [], holidays: [], settings: { timeInputMethod: 'ClockInOut', payPeriodInterval: 'Bi-Weekly', payPeriodStartDate: '2026-01-05' } };
    vi.mocked(payPeriodConfigSnapshotCache.get).mockReturnValue(cached as any);

    const snapshot = await readPayPeriodConfigSnapshot('report-1');

    expect(snapshot).toBe(cached);
    expect(readTabs).not.toHaveBeenCalled();
  });

  it('throws when the Settings tab is empty', async () => {
    vi.mocked(readTabs).mockResolvedValue([[], [], [], [], []]);

    await expect(readPayPeriodConfigSnapshot('report-1')).rejects.toThrow('Settings not found in pay period config snapshot');
  });
});
