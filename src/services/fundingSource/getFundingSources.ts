import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import FundingSource from '#models/FundingSource.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Resolves the client's payrollConfigFileId and returns all funding sources via the cached PayrollConfig bundle.
const getFundingSources = async (clientId: string): Promise<FundingSource[]> => {
  logger.info(`getFundingSources clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  return payrollConfig.fundingSources;
};

export default getFundingSources;
