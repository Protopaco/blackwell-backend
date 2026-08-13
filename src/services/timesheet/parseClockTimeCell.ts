// Matches the "hh:mm AM/PM" pattern applied to ClockInOut In/Out cells (see formatClockInOutTimesheet's
// CLOCK_IN_OUT_TIME_FORMAT_PATTERN) once Sheets renders them as a formatted string, e.g. "09:00 AM".
const CLOCK_TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

// Parses a ClockInOut In/Out cell's formatted value into decimal hours-of-day (9.5 for "9:30 AM") — the
// read path (readTimesheetEntries) calls this once it knows the slot's activity is recognized and the
// cell isn't blank. Returns null for a blank cell, NaN for anything present that doesn't match the
// expected time format. Callers must check for NaN explicitly and throw — this deliberately does not
// silently coerce garbage input the way the pre-existing Hours-mode NaN bug (tracked in [077]) does.
const parseClockTimeCell = (cellValue: unknown): number | null => {
  if (cellValue === undefined || cellValue === null || cellValue === '') return null;

  const match = String(cellValue).trim().match(CLOCK_TIME_PATTERN);
  if (!match) return NaN;

  const [, hourText, minuteText, meridiemText] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour < 1 || hour > 12 || minute > 59) return NaN;

  const hourIn24 = meridiemText.toUpperCase() === 'AM' ? hour % 12 : (hour % 12) + 12;
  return hourIn24 + minute / 60;
};

export default parseClockTimeCell;
