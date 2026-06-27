import appendRow from '#db/adapter/appendRow.js';
import PayPeriod from '#models/PayPeriod.js';

// Appends a new pay period row to the current year's tab in the pay period registry file.
const appendPayPeriod = async (payPeriodRegistryFileId: string, payPeriod: PayPeriod): Promise<void> => {
  const currentYear = String(new Date().getFullYear());

  const row: Record<string, unknown> = {
    PayPeriodId: payPeriod.payPeriodId,
    PayPeriodName: payPeriod.payPeriodName,
    Status: payPeriod.status,
    StartDate: payPeriod.startDate,
    EndDate: payPeriod.endDate,
    CreatedDate: payPeriod.createdDate || new Date().toISOString(),
    PayrollReportFileId: payPeriod.payrollReportFileId ?? '',
  };

  await appendRow(payPeriodRegistryFileId, currentYear, row);
};

export default appendPayPeriod;
