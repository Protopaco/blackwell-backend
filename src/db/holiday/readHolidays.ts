import readTab from '#db/adapter/readTab.js';
import { HOLIDAYS_TAB } from '#config/constants.js';
import Holiday from '#models/Holiday.js';
import mapHoliday from '#db/holiday/mapHoliday.js';

// Reads all holidays from the Holidays tab of the given workbook (PayrollConfig or a pay period's report workbook).
const readHolidays = async (workbookId: string): Promise<Holiday[]> => {
  const rows = await readTab(workbookId, HOLIDAYS_TAB);
  return rows.map(mapHoliday);
};

export default readHolidays;
