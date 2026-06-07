import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import getPayPeriods from '#db/payPeriod/getPayPeriods.js';
import PayPeriod from '#models/PayPeriod.js';

const updatePayPeriod = async (
  payPeriodRegistryFileId: string,
  updatedPayPeriod: PayPeriod,
): Promise<void> => {
  const currentYear = String(new Date().getFullYear());
  const payPeriods = await getPayPeriods(payPeriodRegistryFileId);

  const index = payPeriods.findIndex((pp) => pp.payPeriodId === updatedPayPeriod.payPeriodId);
  if (index === -1) throw new Error(`Pay period not found: ${updatedPayPeriod.payPeriodId}`);

  payPeriods[index] = updatedPayPeriod;

  const rows = payPeriods.map((pp) => ({
    PayPeriodId: pp.payPeriodId,
    PayPeriodName: pp.payPeriodName,
    Status: pp.status,
    StartDate: pp.startDate,
    EndDate: pp.endDate,
    CreatedDate: pp.createdDate,
  }));

  await sheetsAdapter.writeTab(payPeriodRegistryFileId, currentYear, rows);
};

export default updatePayPeriod;
