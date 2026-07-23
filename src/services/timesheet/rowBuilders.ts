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

// Builds the top header row's label.
const buildPayPeriodLabelRow = (): unknown[] => ['Pay Period:'];

// Builds the row showing the pay period date range, directly below the label row.
const buildPayPeriodValueRow = (payPeriodName: string): unknown[] => [payPeriodName];

// Builds the employee name row below the header.
const buildEmployeeNameRow = (firstName: string, lastName: string): unknown[] =>
  [`${firstName} ${lastName}`];

// Builds the employee position row directly below the name row.
const buildPositionRow = (position: string): unknown[] => [position];

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

// Builds the row of M/D formatted dates for a week, with "Total" in the weekly total column.
const buildDateRow = (dates: Date[], maxDays: number): unknown[] =>
  ['', ...dates.map(formatDateHeader), ...Array(maxDays - dates.length).fill(''), 'Total'];

// Builds a blank data-entry row for a single activity with one empty cell per day, plus a SUM formula
// in the weekly total column covering that row's day cells. rowNumber is this row's own 1-based sheet row.
const buildActivityRow = (activity: Activity, numberOfDays: number, rowNumber: number): unknown[] => {
  const firstDayCol = colLetter(1);
  const lastDayCol = colLetter(numberOfDays);
  return [
    activity.activityName,
    ...Array(numberOfDays).fill(''),
    `=SUM(${firstDayCol}${rowNumber}:${lastDayCol}${rowNumber})`,
  ];
};

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

// Builds the include-in-payroll checkbox row with a label and a default-checked value — cell location is tracked in the manifest.
const buildIncludeInPayrollRow = (label: string): unknown[] => [label, true];

export {
  colLetter,
  buildPayPeriodLabelRow,
  buildPayPeriodValueRow,
  buildEmployeeNameRow,
  buildPositionRow,
  buildDividerRow,
  buildHolidayRow,
  buildDayRow,
  buildDateRow,
  buildActivityRow,
  buildDailyTotalRow,
  buildSummaryRow,
  buildSignatureRow,
  buildIncludeInPayrollRow,
};
