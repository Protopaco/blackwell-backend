import getPayPeriodById from '#services/payPeriod/getPayPeriodById.js';
import readAllocationReportTab from '#db/payrollReport/readAllocationReportTab.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import Guid from '#models/Guid.js';
import { NotFoundError } from '#utils/errors.js';
import { logger } from '#utils/logger.js';

const getAllocationReport = async (clientId: Guid, payPeriodId: Guid): Promise<AllocationReportRow[]> => {
  logger.info(`getAllocationReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const payPeriod = await getPayPeriodById(clientId, payPeriodId);

  if (!payPeriod.payrollReportFileId) throw new NotFoundError(`No payroll report file exists for pay period: ${payPeriodId}`);

  return (await readAllocationReportTab(payPeriod.payrollReportFileId)) ?? [];
};

export default getAllocationReport;
