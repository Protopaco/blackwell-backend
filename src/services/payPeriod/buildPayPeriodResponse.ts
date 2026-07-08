import PayPeriod from '#models/PayPeriod.js';
import PayPeriodResponse from '#models/PayPeriodResponse.js';

// Strips payrollReportFileId (internal-only) before a PayPeriod goes out over the API.
const buildPayPeriodResponse = (payPeriod: PayPeriod): PayPeriodResponse => {
  const { payrollReportFileId, ...response } = payPeriod;
  return response;
};

export default buildPayPeriodResponse;
