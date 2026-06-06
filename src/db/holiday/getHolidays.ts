import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import Holiday from '#models/Holiday.js';

const mapToHoliday = (row: Record<string, unknown>): Holiday => ({
  holidayId: row['HolidayId'] as string,
  holidayName: row['HolidayName'] as string,
  holidayDate: row['HolidayDate'] as string,
});

const getHolidays = async (payrollConfigFileId: string): Promise<Holiday[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'Holidays');
  return rows.map(mapToHoliday);
};

export default getHolidays;
