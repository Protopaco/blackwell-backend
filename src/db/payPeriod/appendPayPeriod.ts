import appendRow from '#db/adapter/appendRow.js';
import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeHeaderRow from '#db/adapter/writeHeaderRow.js';
import { PAY_PERIOD_HEADERS } from '#config/constants.js';
import PayPeriod from '#models/PayPeriod.js';
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';

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

  await createTabIfNotExists(payPeriodRegistryFileId, currentYear);
  await writeHeaderRow(payPeriodRegistryFileId, currentYear, PAY_PERIOD_HEADERS);
  await appendRow(payPeriodRegistryFileId, currentYear, PAY_PERIOD_HEADERS, row);
  payPeriodsCache.delete(payPeriodRegistryFileId);
};

export default appendPayPeriod;
