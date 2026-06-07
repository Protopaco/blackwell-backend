import Holiday from '#models/Holiday.js';

const mapHoliday = (row: Record<string, unknown>): Holiday => ({
  holidayId: row['HolidayId'] as string,
  holidayName: row['HolidayName'] as string,
  holidayDate: row['HolidayDate'] as string,
});

export default mapHoliday;
