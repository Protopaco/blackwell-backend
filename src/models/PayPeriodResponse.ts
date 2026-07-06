import PayPeriod from '#models/PayPeriod.js';

// The PayPeriod shape returned over the API — payrollReportFileId is internal-only, stripped before the response goes out.
type PayPeriodResponse = Omit<PayPeriod, 'payrollReportFileId'>;

export default PayPeriodResponse;
