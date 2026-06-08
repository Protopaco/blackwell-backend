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

const buildHeaderRow = (payPeriodName: string): unknown[] =>
  ['Pay Period:', payPeriodName];

const buildEmployeeRow = (firstName: string, lastName: string, position: string): unknown[] =>
  [`${firstName} ${lastName}`, position];

const buildDividerRow = (): unknown[] => [];

const buildHolidayRow = (dates: Date[], holidays: Holiday[]): unknown[] => {
  const row: unknown[] = [''];
  for (const date of dates) {
    row.push(getHolidayName(date, holidays) ?? '');
  }
  return row;
};

const buildDayRow = (dates: Date[]): unknown[] =>
  ['', ...dates.map(getDayOfWeek)];

const buildDateRow = (dates: Date[]): unknown[] =>
  ['', ...dates.map(formatDateHeader)];

const buildActivityRow = (activity: Activity, numberOfDays: number): unknown[] =>
  [activity.activityName, ...Array(numberOfDays).fill('')];

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

const buildSummaryRow = (label: string, formula: string): unknown[] =>
  [label, formula];

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
