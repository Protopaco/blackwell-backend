import appendHoliday from '#db/holiday/appendHoliday.js';
import getClientById from '#services/client/getClientById.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import validateIsoDateString from '#utils/validateIsoDateString.js';
import Holiday from '#models/Holiday.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Assigns a new UUID and appends a holiday to the client's PayrollConfig.
const createHoliday = async (
  clientId: string,
  holiday: Omit<Holiday, 'holidayId'>,
): Promise<void> => {
  logger.info(`createHoliday clientId=${clientId}`);

  validateIsoDateString(holiday.holidayDate, 'holidayDate');

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const newHoliday: Holiday = {
    ...holiday,
    holidayId: crypto.randomUUID(),
  };

  await appendHoliday(client.payrollConfigFileId, newHoliday);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createHoliday;
