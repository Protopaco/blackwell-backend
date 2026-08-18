import Activity from '#models/Activity.js';
import Holiday from '#models/Holiday.js';
import { formatDateHeader, formatWeekRangeLabel, getDayOfWeek, getHolidayName } from '#utils/dateUtils.js';
import {
  CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET,
  CLOCK_IN_OUT_IN_COLUMN_OFFSET,
  CLOCK_IN_OUT_OUT_COLUMN_OFFSET,
  CLOCK_IN_OUT_TOTAL_COLUMN_OFFSET,
} from '#config/constants.js';

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

// Builds the sectionLabelRow that introduces a named activity group within a week — the group label in
// column A, with the rest of the row left blank. "Total" lives on the week's dateRow instead (see
// buildDateRow), since a group header row doesn't exist for ungrouped activities.
const buildSectionLabelRow = (sectionLabel: string, maxDays: number): unknown[] =>
  [sectionLabel, ...Array(maxDays + 1).fill('')];

// Builds the weekLabelRow: the week's date-range label in column A (e.g. "Week 6/1 - 6/7"), plus the
// holiday name above each date column where a holiday falls.
const buildHolidayRow = (dates: Date[], holidays: Holiday[], weekLabel = ''): unknown[] => {
  const row: unknown[] = [weekLabel];
  for (const date of dates) {
    row.push(getHolidayName(date, holidays) ?? '');
  }
  return row;
};

// Builds the row of abbreviated day names (Mon, Tue, etc.) for a week.
const buildDayRow = (dates: Date[]): unknown[] =>
  ['', ...dates.map(getDayOfWeek)];

// Builds the row of M/D formatted dates for a week, with "Total" in the weekly total column — the one
// place that header appears, since not every group has its own sectionLabelRow (ungrouped activities
// don't get a group header row at all).
const buildDateRow = (dates: Date[], maxDays: number): unknown[] =>
  ['', ...dates.map(formatDateHeader), ...Array(maxDays - dates.length).fill(''), 'Total'];

// Builds a blank data-entry row for a single activity with one empty cell per day, a SUM formula in the
// weekly total column covering that row's day cells, and a trailing cell naming the unit that total is
// captured in ("hours" or "shifts" — see getActivityRowUnitLabel). rowNumber is this row's own 1-based
// sheet row.
const buildActivityRow = (activity: Activity, numberOfDays: number, rowNumber: number, unitLabel: string): unknown[] => {
  const firstDayCol = colLetter(1);
  const lastDayCol = colLetter(numberOfDays);
  return [
    activity.activityName,
    ...Array(numberOfDays).fill(''),
    `=SUM(${firstDayCol}${rowNumber}:${lastDayCol}${rowNumber})`,
    unitLabel,
  ];
};

// Builds a ClockInOut week's label row content (e.g. "Week 3/30 - 4/5"), scoped to just that week's own
// 4-column group — weeks sit side by side, each with its own label, rather than one label spanning the
// whole sheet width.
const buildClockInOutWeekLabelRow = (dates: Date[]): unknown[] => [
  formatWeekRangeLabel(dates),
  '',
  '',
  '',
];

// Builds a ClockInOut day's header row: just the day name + date, in that week's label column. The
// column headers (Hourly/In/Out/Total) are a separate row below — see buildClockInOutColumnHeaderRow.
const buildClockInOutDayHeaderRow = (date: Date): unknown[] => [
  `${getDayOfWeek(date)} ${formatDateHeader(date)}`,
  '',
  '',
  '',
];

// Builds the "Hourly"/"In"/"Out"/"Total" column header row directly below a day's header row.
const buildClockInOutColumnHeaderRow = (): unknown[] => ['Hourly', 'In', 'Out', 'Total'];

// Builds one generic ClockInOut entry slot: blank activity dropdown, Clock In, and Clock Out cells, plus
// a display-only Total formula (rounded to the nearest 15 minutes). This formula is for the employee/
// supervisor's visibility only — readTimesheetEntries recomputes hours independently rather than
// trusting it, since several of its validation rules need to inspect the raw In/Out values anyway.
// labelColumnIndex is the 0-based sheet column where this row's week group starts (weeks sit side by
// side — see buildClockInOutTimesheet), needed so the formula references the correct absolute columns.
const buildClockInOutSlotRow = (rowNumber: number, labelColumnIndex: number): unknown[] => {
  const inCellReference = `${colLetter(labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET)}${rowNumber}`;
  const outCellReference = `${colLetter(labelColumnIndex + CLOCK_IN_OUT_OUT_COLUMN_OFFSET)}${rowNumber}`;
  return [
    '',
    '',
    '',
    `=IF(OR(${inCellReference}="",${outCellReference}=""),"",MROUND((${outCellReference}-${inCellReference})*24,0.25))`,
  ];
};

// Builds the "Flat Rate"/"Shifts"/"Total" header row that introduces a ClockInOut week's Flat Rate
// section — Shifts and Total occupy the same In/Out column pair the Hourly slots use above (Shifts
// spans both visually via a merge, applied as formatting — see formatClockInOutTimesheet).
const buildClockInOutFlatRateSectionLabelRow = (): unknown[] => ['Flat Rate', 'Shifts', '', 'Total'];

// Builds one Flat Rate activity's row: the activity name, a blank Shifts cell for data entry, and a
// Total formula that just echoes the Shifts value — flat-rate activities aren't clocked in/out, so
// there's no computation, only a display of what was entered (per 2026-08-12 decision).
const buildClockInOutFlatRateActivityRow = (
  activity: Activity,
  rowNumber: number,
  labelColumnIndex: number,
): unknown[] => {
  const shiftsCellReference = `${colLetter(labelColumnIndex + CLOCK_IN_OUT_IN_COLUMN_OFFSET)}${rowNumber}`;
  return [activity.activityName, '', '', `=${shiftsCellReference}`];
};

// Builds a summary row at the bottom of the timesheet with a label and a pre-computed formula string.
const buildSummaryRow = (label: string, formula: string): unknown[] =>
  [label, formula];

// Builds a signature row: a label, an empty signature cell (columns B-D, merged by formatSignatureRows),
// a "Date" label, and an empty date-entry cell — cell location is tracked in the manifest.
const buildSignatureRow = (label: string): unknown[] => [label, '', '', '', 'Date', ''];

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
  buildSectionLabelRow,
  buildActivityRow,
  buildClockInOutWeekLabelRow,
  buildClockInOutDayHeaderRow,
  buildClockInOutColumnHeaderRow,
  buildClockInOutSlotRow,
  buildClockInOutFlatRateSectionLabelRow,
  buildClockInOutFlatRateActivityRow,
  buildSummaryRow,
  buildSignatureRow,
  buildIncludeInPayrollRow,
};
