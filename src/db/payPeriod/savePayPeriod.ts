import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import PayPeriod from '#models/PayPeriod.js';

const savePayPeriod = async (payPeriodRegistryFileId: string, payPeriod: PayPeriod): Promise<void> => {
  const currentYear = String(new Date().getFullYear());

  const row: Record<string, unknown> = {
    PayPeriodId: payPeriod.payPeriodId,
    PayPeriodName: payPeriod.payPeriodName,
    Status: payPeriod.status,
    StartDate: payPeriod.startDate,
    EndDate: payPeriod.endDate,
    CreatedDate: payPeriod.createdDate || new Date().toISOString(),
  };

  await sheetsAdapter.appendRow(payPeriodRegistryFileId, currentYear, row);
};

export default savePayPeriod;
