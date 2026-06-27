import readTab from '#db/adapter/readTab.js';
import PayPeriod from '#models/PayPeriod.js';
import { PayPeriodStatusType } from '#models/PayPeriodStatus.js';

// Converts a raw pay period registry row into a PayPeriod model.
const mapToPayPeriod = (row: Record<string, unknown>): PayPeriod => ({
  payPeriodId: row['PayPeriodId'] as string,
  payPeriodName: row['PayPeriodName'] as string,
  status: row['Status'] as PayPeriodStatusType,
  startDate: row['StartDate'] as string,
  endDate: row['EndDate'] as string,
  createdDate: row['CreatedDate'] as string,
  payrollReportFileId: (row['PayrollReportFileId'] as string) ?? '',
});

// Reads all pay periods for the current calendar year from the pay period registry file.
const readPayPeriods = async (payPeriodRegistryFileId: string): Promise<PayPeriod[]> => {
  const currentYear = String(new Date().getFullYear());
  const rows = await readTab(payPeriodRegistryFileId, currentYear);
  return rows.map(mapToPayPeriod);
};

export default readPayPeriods;
