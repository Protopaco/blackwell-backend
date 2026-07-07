import { describe, it, expect } from 'vitest';
import buildPayPeriodResponse from '#services/payPeriod/buildPayPeriodResponse.js';
import PayPeriod from '#models/PayPeriod.js';

const payPeriod: PayPeriod = {
  payPeriodId: 'p1',
  payPeriodName: '06/01 - 06/14',
  status: 'Open',
  startDate: '2026-06-01',
  endDate: '2026-06-14',
  createdDate: '2026-05-28',
  payrollReportFileId: 'file-1',
};

describe('buildPayPeriodResponse', () => {
  it('strips payrollReportFileId', () => {
    const response = buildPayPeriodResponse(payPeriod);
    expect(response).not.toHaveProperty('payrollReportFileId');
  });

  it('passes through every other field unchanged', () => {
    const response = buildPayPeriodResponse(payPeriod);
    expect(response).toEqual({
      payPeriodId: 'p1',
      payPeriodName: '06/01 - 06/14',
      status: 'Open',
      startDate: '2026-06-01',
      endDate: '2026-06-14',
      createdDate: '2026-05-28',
    });
  });
});
