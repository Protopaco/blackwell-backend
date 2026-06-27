import readTab from '#db/adapter/readTab.js';
import Holiday from '#models/Holiday.js';
import mapHoliday from '#db/holiday/mapHoliday.js';

// Reads all holidays from the Holidays tab of a client's payroll config file.
const readHolidays = async (payrollConfigFileId: string): Promise<Holiday[]> => {
  const rows = await readTab(payrollConfigFileId, 'Holidays');
  return rows.map(mapHoliday);
};

export default readHolidays;
