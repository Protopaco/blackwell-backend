import PayPeriod from '#models/PayPeriod.js';
import { PayPeriodStatusType } from '#models/PayPeriodStatus.js';

// Converts a raw pay period registry row into a PayPeriod model.
const mapPayPeriod = (row: Record<string, unknown>): PayPeriod => ({
  payPeriodId: row['PayPeriodId'] as string,
  payPeriodName: row['PayPeriodName'] as string,
  status: row['Status'] as PayPeriodStatusType,
  startDate: row['StartDate'] as string,
  endDate: row['EndDate'] as string,
  createdDate: row['CreatedDate'] as string,
  payrollReportFileId: (row['PayrollReportFileId'] as string) ?? '',
});

export default mapPayPeriod;
