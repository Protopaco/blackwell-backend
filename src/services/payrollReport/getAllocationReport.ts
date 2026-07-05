import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readAllocationReportTab from '#db/payrollReport/readAllocationReportTab.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import Guid from '#models/Guid.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

const getAllocationReport = async (clientId: Guid, payPeriodId: Guid): Promise<AllocationReportRow[]> => {
  logger.info(`getAllocationReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  if (!payPeriod.payrollReportFileId) return [];

  return readAllocationReportTab(payPeriod.payrollReportFileId);
};

export default getAllocationReport;
