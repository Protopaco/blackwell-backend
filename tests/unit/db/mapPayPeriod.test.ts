import { describe, it, expect } from 'vitest';
import mapPayPeriod from '#db/payPeriod/mapPayPeriod.js';

describe('mapPayPeriod', () => {
  it('maps a full row to a PayPeriod', () => {
    const payPeriod = mapPayPeriod({
      PayPeriodId: 'p1',
      PayPeriodName: '06/01 - 06/14',
      Status: 'Open',
      StartDate: '2026-06-01',
      EndDate: '2026-06-14',
      CreatedDate: '2026-05-28',
      PayrollReportFileId: 'file-1',
    });

    expect(payPeriod).toEqual({
      payPeriodId: 'p1',
      payPeriodName: '06/01 - 06/14',
      status: 'Open',
      startDate: '2026-06-01',
      endDate: '2026-06-14',
      createdDate: '2026-05-28',
      payrollReportFileId: 'file-1',
    });
  });

  describe('payrollReportFileId fallback', () => {
    it('keeps a present value', () => {
      expect(mapPayPeriod({ PayrollReportFileId: 'file-1' }).payrollReportFileId).toBe('file-1');
    });

    it('falls back to an empty string when missing', () => {
      expect(mapPayPeriod({}).payrollReportFileId).toBe('');
    });

    it('falls back to an empty string for an explicit null', () => {
      expect(mapPayPeriod({ PayrollReportFileId: null }).payrollReportFileId).toBe('');
    });
  });
});
