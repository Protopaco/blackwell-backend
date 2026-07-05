import writeTab from '#db/adapter/writeTab.js';
import getPayPeriods from "#db/payPeriod/readPayPeriods.js";
import payPeriodsCache from '#utils/caches/payPeriodsCache.js';
import PayPeriod from "#models/PayPeriod.js";

// Overwrites all pay period rows for the current year, updating the one matching the given pay period — used when changing status.
const writePayPeriod = async (
  payPeriodRegistryFileId: string,
  updatedPayPeriod: PayPeriod,
): Promise<void> => {
  const currentYear = String(new Date().getFullYear());
  const payPeriods = await getPayPeriods(payPeriodRegistryFileId);

  const index = payPeriods.findIndex(
    (pp) => pp.payPeriodId === updatedPayPeriod.payPeriodId,
  );
  if (index === -1)
    throw new Error(`Pay period not found: ${updatedPayPeriod.payPeriodId}`);

  payPeriods[index] = updatedPayPeriod;

  const rows = payPeriods.map((pp) => ({
    PayPeriodId: pp.payPeriodId,
    PayPeriodName: pp.payPeriodName,
    Status: pp.status,
    StartDate: pp.startDate,
    EndDate: pp.endDate,
    CreatedDate: pp.createdDate,
    PayrollReportFileId: pp.payrollReportFileId,
  }));

  await writeTab(payPeriodRegistryFileId, currentYear, rows);
  payPeriodsCache.delete(payPeriodRegistryFileId);
};

export default writePayPeriod;
