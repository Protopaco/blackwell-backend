import Holiday from '#models/Holiday.js';

// Converts a raw Holidays sheet row into a Holiday model.
const mapHoliday = (row: Record<string, unknown>): Holiday => ({
  holidayId: row['HolidayId'] as string,
  holidayName: row['HolidayName'] as string,
  holidayDate: row['HolidayDate'] as string,
});

export default mapHoliday;
