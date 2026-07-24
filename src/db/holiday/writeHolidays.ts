import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readHolidays from '#db/holiday/readHolidays.js';
import mapHolidayRow from '#db/holiday/mapHolidayRow.js';
import { HOLIDAYS_TAB, HOLIDAYS_HEADERS } from '#config/constants.js';
import Holiday from '#models/Holiday.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all holiday rows, updating the one matching the given holiday.
const writeHolidays = async (
  workbookId: string,
  updatedHoliday: Holiday,
): Promise<void> => {
  const holidays = await readHolidays(workbookId);

  const index = holidays.findIndex((holiday) => holiday.holidayId === updatedHoliday.holidayId);
  if (index === -1) throw new NotFoundError(`Holiday not found: ${updatedHoliday.holidayId}`);

  holidays[index] = updatedHoliday;

  const rows = holidays.map(mapHolidayRow);

  await overwriteTabRows(workbookId, HOLIDAYS_TAB, HOLIDAYS_HEADERS, rows);
};

export default writeHolidays;
