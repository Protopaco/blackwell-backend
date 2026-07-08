import { describe, it, expect } from 'vitest';
import sortTimesheetTabs from '#services/timesheet/sortTimesheetTabs.js';
import PayPeriod from '#models/PayPeriod.js';

const buildPayPeriod = (overrides: Partial<PayPeriod>): PayPeriod => ({
  payPeriodId: 'p',
  payPeriodName: 'unnamed',
  status: 'Open',
  startDate: '2026-01-01',
  endDate: '2026-01-14',
  createdDate: '2026-01-01',
  payrollReportFileId: '',
  ...overrides,
});

describe('sortTimesheetTabs', () => {
  it('returns an empty array when no tabs exist', () => {
    expect(sortTimesheetTabs([], [])).toEqual([]);
  });

  it('sorts pay period tabs newest-first by real startDate, not by tab name', () => {
    const payPeriods = [
      buildPayPeriod({ payPeriodName: 'Z-first', startDate: '2026-01-01' }),
      buildPayPeriod({ payPeriodName: 'A-second', startDate: '2026-06-01' }),
    ];
    const order = sortTimesheetTabs(['Z-first', 'A-second'], payPeriods);
    expect(order).toEqual(['A-second', 'Z-first']);
  });

  it('pins _manifest last regardless of its position in the input', () => {
    const payPeriods = [buildPayPeriod({ payPeriodName: '06/01 - 06/14', startDate: '2026-06-01' })];
    const order = sortTimesheetTabs(['_manifest', '06/01 - 06/14'], payPeriods);
    expect(order).toEqual(['06/01 - 06/14', '_manifest']);
  });

  it('places unmatched tabs after matched pay period tabs and before _manifest', () => {
    const payPeriods = [buildPayPeriod({ payPeriodName: '06/01 - 06/14', startDate: '2026-06-01' })];
    const order = sortTimesheetTabs(['Sheet1', '06/01 - 06/14', '_manifest'], payPeriods);
    expect(order).toEqual(['06/01 - 06/14', 'Sheet1', '_manifest']);
  });

  it('orders a realistic multi-period workbook correctly', () => {
    const payPeriods = [
      buildPayPeriod({ payPeriodName: '06/01 - 06/14', startDate: '2026-06-01' }),
      buildPayPeriod({ payPeriodName: '06/15 - 06/28', startDate: '2026-06-15' }),
      buildPayPeriod({ payPeriodName: '05/18 - 05/31', startDate: '2026-05-18' }),
    ];
    const order = sortTimesheetTabs(
      ['05/18 - 05/31', '_manifest', '06/01 - 06/14', '06/15 - 06/28'],
      payPeriods,
    );
    expect(order).toEqual(['06/15 - 06/28', '06/01 - 06/14', '05/18 - 05/31', '_manifest']);
  });
});
