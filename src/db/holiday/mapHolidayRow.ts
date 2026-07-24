import Holiday from '#models/Holiday.js';

// Maps a Holiday back to a sheet-row object keyed by HOLIDAYS_HEADERS — the write-side inverse of mapHoliday.ts.
const mapHolidayRow = (holiday: Holiday): Record<string, unknown> => ({
  HolidayId: holiday.holidayId,
  HolidayName: holiday.holidayName,
  HolidayDate: holiday.holidayDate,
});

export default mapHolidayRow;
