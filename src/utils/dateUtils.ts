import Holiday from '#models/Holiday.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const chunkDatesByWeek = (dates: Date[]): Date[][] => {
  const weeks: Date[][] = [];

  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return weeks;
};

const formatDateHeader = (date: Date): string => {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${month}/${day}`;
};

const getDayOfWeek = (date: Date): string => {
  return DAY_NAMES[date.getUTCDay()];
};

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
