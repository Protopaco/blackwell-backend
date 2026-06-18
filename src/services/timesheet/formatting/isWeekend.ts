// Returns true if the ISO date string falls on a Saturday (6) or Sunday (0).
const isWeekend = (isoDateString: string): boolean => {
  const dayOfWeek = new Date(isoDateString).getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export default isWeekend;
