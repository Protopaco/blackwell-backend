import writeValues from '#db/adapter/writeValues.js';
import mapHolidayRow from '#db/holiday/mapHolidayRow.js';
import { HOLIDAYS_TAB, HOLIDAYS_HEADERS } from '#config/constants.js';
import Holiday from '#models/Holiday.js';

// Writes a full set of holidays to the given workbook's Holidays tab in one call — header row always
// included, even for an empty list. Assumes the tab already exists (see createTabsIfNotExists.js).
const writeHolidaysBulk = async (workbookId: string, holidays: Holiday[]): Promise<void> => {
  const rows = holidays.map(mapHolidayRow);
  const values = [HOLIDAYS_HEADERS, ...rows.map((row) => HOLIDAYS_HEADERS.map((header) => row[header] ?? ''))];

  await writeValues(workbookId, HOLIDAYS_TAB, values);
};

export default writeHolidaysBulk;
