import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readAllocationReportTab from '#db/payrollReport/readAllocationReportTab.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';

const getAllocationReport = async (clientId: Guid, payPeriodId: Guid): Promise<AllocationReportRow[]> => {
  logger.info(`getAllocationReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  if (!payPeriod.payrollReportFileId) return [];

  return (await readAllocationReportTab(payPeriod.payrollReportFileId)) ?? [];
};

export default getAllocationReport;
