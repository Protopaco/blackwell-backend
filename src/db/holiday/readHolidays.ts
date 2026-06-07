import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Holiday from '#models/Holiday.js';
import mapHoliday from '#db/holiday/mapHoliday.js';

const readHolidays = async (payrollConfigFileId: string): Promise<Holiday[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Holidays');
  return rows.map(mapHoliday);
};

export default readHolidays;
