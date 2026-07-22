import writeHolidays from '#db/holiday/writeHolidays.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import validateIsoDateString from '#utils/validateIsoDateString.js';
import Holiday from '#models/Holiday.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites a holiday record in the client's PayrollConfig.
const updateHoliday = async (clientId: string, updatedHoliday: Holiday): Promise<void> => {
  logger.info(`updateHoliday clientId=${clientId} holidayId=${updatedHoliday.holidayId}`);

  validateIsoDateString(updatedHoliday.holidayDate, 'holidayDate');

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  await writeHolidays(client.payrollConfigFileId, updatedHoliday);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateHoliday;
