import deleteHolidayRow from '#db/holiday/deleteHolidayRow.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a holiday from the client's PayrollConfig.
const deleteHoliday = async (clientId: string, holidayId: string): Promise<void> => {
  logger.info(`deleteHoliday clientId=${clientId} holidayId=${holidayId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await deleteHolidayRow(client.payrollConfigFileId, holidayId);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default deleteHoliday;
