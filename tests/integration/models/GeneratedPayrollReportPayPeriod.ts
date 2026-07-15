import PayPeriod from '#models/PayPeriod.js';
import PayrollReportReadyPayPeriod from './PayrollReportReadyPayPeriod.js';

type GeneratedPayrollReportPayPeriod = PayrollReportReadyPayPeriod & {
  payPeriod: PayPeriod;
  payrollReportFileId: string;
};

export default GeneratedPayrollReportPayPeriod;
