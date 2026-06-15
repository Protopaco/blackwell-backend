import Activity from '#models/Activity.js';
import Holiday from '#models/Holiday.js';
import { formatDateHeader, getDayOfWeek, getHolidayName } from '#utils/dateUtils.js';

// colIndex is 0-based: 0=A, 1=B, 26=AA
const colLetter = (colIndex: number): string => {
  let result = '';
  let remaining = colIndex + 1;
  while (remaining > 0) {
    remaining--;
    result = String.fromCharCode(65 + (remaining % 26)) + result;
    remaining = Math.floor(remaining / 26);
  }
  return result;
};

// Builds the top header row showing the pay period name.
const buildHeaderRow = (payPeriodName: string): unknown[] =>
  ['Pay Period:', payPeriodName];

// Builds the employee name and position row below the header.
const buildEmployeeRow = (firstName: string, lastName: string, position: string): unknown[] =>
  [`${firstName} ${lastName}`, position];

// Returns an empty row used as a visual separator between sections.
const buildDividerRow = (): unknown[] => [];

// Builds a row showing holiday names above each date column where a holiday falls.
const buildHolidayRow = (dates: Date[], holidays: Holiday[]): unknown[] => {
  const row: unknown[] = [''];
  for (const date of dates) {
    row.push(getHolidayName(date, holidays) ?? '');
  }
  return row;
};

// Builds the row of abbreviated day names (Mon, Tue, etc.) for a week.
const buildDayRow = (dates: Date[]): unknown[] =>
  ['', ...dates.map(getDayOfWeek)];

// Builds the row of M/D formatted dates for a week.
const buildDateRow = (dates: Date[]): unknown[] =>
  ['', ...dates.map(formatDateHeader)];

// Builds a blank data-entry row for a single activity with one empty cell per day.
const buildActivityRow = (activity: Activity, numberOfDays: number): unknown[] =>
  [activity.activityName, ...Array(numberOfDays).fill('')];

// Builds the daily total row with SUM formulas covering all hourly activity rows for each day.
const buildDailyTotalRow = (
  dates: Date[],
  firstActivityRow: number,
  lastActivityRow: number,
  dailyTotalRowNum: number,
): unknown[] => {
  const row: unknown[] = ['Daily Total'];
  for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
    const dayColLetter = colLetter(dayIndex + 1);
    row.push(`=SUM(${dayColLetter}${firstActivityRow}:${dayColLetter}${lastActivityRow})`);
  }
  const firstDayCol = colLetter(1);
  const lastDayCol = colLetter(dates.length);
  row.push(`=SUM(${firstDayCol}${dailyTotalRowNum}:${lastDayCol}${dailyTotalRowNum})`);
  return row;
};

// Builds a summary row at the bottom of the timesheet with a label and a pre-computed formula string.
const buildSummaryRow = (label: string, formula: string): unknown[] =>
  [label, formula];

// Builds a signature row with just a label and an empty cell for the signature — cell location is tracked in the manifest.
const buildSignatureRow = (label: string): unknown[] => [label];

export {
  colLetter,
  buildHeaderRow,
  buildEmployeeRow,
  buildDividerRow,
  buildHolidayRow,
  buildDayRow,
  buildDateRow,
  buildActivityRow,
  buildDailyTotalRow,
  buildSummaryRow,
  buildSignatureRow,
};
