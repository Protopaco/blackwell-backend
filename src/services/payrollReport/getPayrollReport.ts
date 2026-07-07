import readClientById from '#db/client/readClientById.js';
import readPayPeriodById from '#db/payPeriod/readPayPeriodById.js';
import readPayrollReportSummary from '#db/payrollReport/readPayrollReportSummary.js';
import Guid from '#models/Guid.js';
import PayrollReportResponse from '#models/PayrollReportResponse.js';
import buildPayrollReportResponse from './buildPayrollReportResponse.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Returns the current payroll summary for a pay period grouped by employee, or null if no report has been generated yet.
const getPayrollReport = async (clientId: Guid, payPeriodId: Guid): Promise<PayrollReportResponse | null> => {
  logger.info(`getPayrollReport clientId=${clientId} payPeriodId=${payPeriodId}`);

  const client = await readClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payPeriod = await readPayPeriodById(client.payPeriodRegistryFileId, payPeriodId);
  if (!payPeriod) throw new NotFoundError(`Pay period not found: ${payPeriodId}`);

  if (!payPeriod.payrollReportFileId) return null;

  const rawRows = await readPayrollReportSummary(payPeriod.payrollReportFileId);
  if (rawRows.length === 0) return null;

  return buildPayrollReportResponse(rawRows);
};

export default getPayrollReport;
