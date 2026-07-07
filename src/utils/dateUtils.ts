import Holiday from '#models/Holiday.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Returns every calendar date between two ISO date strings (inclusive), normalized to noon UTC to avoid DST edge cases.
const getDatesBetween = (startDate: string, endDate: string): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  // Normalize to avoid timezone issues
  current.setUTCHours(12, 0, 0, 0);
  end.setUTCHours(12, 0, 0, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

// Splits a flat date array into sub-arrays of up to 7 days each — used to divide a pay period into weekly blocks.
const chunkDatesByWeek = (dates: Date[]): Date[][] => {
  const weeks: Date[][] = [];

  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return weeks;
};

// Formats a date as "M/D" for the date header row of a timesheet (e.g., 5/1 for May 1).
const formatDateHeader = (date: Date): string => {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${month}/${day}`;
};

// Returns the 3-letter day name (Mon, Tue, etc.) for the day-of-week header row.
const getDayOfWeek = (date: Date): string => {
  return DAY_NAMES[date.getUTCDay()];
};

// Returns the holiday name for a date if it matches one of the client's configured holidays, or null.
const getHolidayName = (date: Date, holidays: Holiday[]): string | null => {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = holidays.find((h) => h.holidayDate === dateStr);
  return holiday ? holiday.holidayName : null;
};

export {
  getDatesBetween,
  chunkDatesByWeek,
  formatDateHeader,
  getDayOfWeek,
  getHolidayName,
};
