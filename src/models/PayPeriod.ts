import Guid from './Guid.js';
import { PayPeriodStatusType } from './PayPeriodStatus.js';

interface PayPeriod {
  payPeriodId: Guid;
  payPeriodName: string;
  status: PayPeriodStatusType;
  startDate: string;
  endDate: string;
  createdDate: string;
  payrollReportFileId: string;
}

export default PayPeriod;
