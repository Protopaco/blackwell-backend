import appendRow from '#db/adapter/appendRow.js';
import { HOLIDAYS_TAB, HOLIDAYS_HEADERS } from '#config/constants.js';
import Holiday from '#models/Holiday.js';

// Appends a new holiday row to the Holidays tab.
const appendHoliday = async (workbookId: string, holiday: Holiday): Promise<void> => {
  const row: Record<string, unknown> = {
    HolidayId: holiday.holidayId,
    HolidayName: holiday.holidayName,
    HolidayDate: holiday.holidayDate,
  };

  await appendRow(workbookId, HOLIDAYS_TAB, HOLIDAYS_HEADERS, row);
};

export default appendHoliday;
