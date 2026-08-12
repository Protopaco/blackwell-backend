import Guid from '#models/Guid.js';

interface DateColumnManifest {
  date: string;
  column: number;
}

interface ActivityRowManifest {
  activityId: Guid;
  activityName: string;
  row: number;
}

interface WeekManifest {
  weekIndex: number;
  // firstRow/lastRow bound the week's full block (weekLabelRow through the last row of whichever
  // section — Hourly or Flat Rate — ends the week), used to draw the week's block-level border.
  firstRow: number;
  lastRow: number;
  weekLabelRow: number;
  dayOfWeekRow: number;
  dateRow: number;
  dates: DateColumnManifest[];
  // Always present — the half-height gap between dateRow and whichever section comes first that week.
  headerSpacerRow: number;
  // Hourly and Flat Rate sections are each fully omitted (all fields below undefined, activityRows/
  // flatRateRows empty) when the employee has zero activities of that type.
  hourlySectionLabelRow?: number;
  activityRows: ActivityRowManifest[];
  hourlyDailyTotalRow?: number;
  // Only set when both the Hourly and Flat Rate sections are present that week.
  spacerRow?: number;
  flatRateSectionLabelRow?: number;
  flatRateRows: ActivityRowManifest[];
  flatRateDailyTotalRow?: number;
}

interface SignatureCell {
  row: number;
  column: number;
}

interface SummaryRowManifest {
  label: string;
  row: number;
}

// One generic entry slot within a ClockInOut day block: an activity dropdown cell, a Clock In cell, and
// a Clock Out cell, all on this row. The activity/In/Out columns are fixed relative to whichever week's
// column group the row belongs to (see rowBuilders.ts).
interface ClockInOutSlotRowManifest {
  row: number;
}

// One flat-rate activity's row within a ClockInOut day's Flat Rate section: the Shifts cell (entry) and
// Total cell (a formula echoing Shifts — flat-rate activities aren't clocked in/out, the total is just
// whatever quantity was entered) sit at the same two columns for every flat-rate row in a given day.
interface ClockInOutFlatRateRowManifest {
  activityId: Guid;
  activityName: string;
  row: number;
}

// One day within a ClockInOut pay period: a day header row (day name + date), a column header row
// ("Hourly"/"In"/"Out"/"Total"), a fixed number of generic entry slots, and — when the employee has any
// flat-rate activities — that day's own Flat Rate section directly below the slots (per 2026-08-12
// decision: every day gets both an Hourly and a Flat Rate section, not one Flat Rate section per week).
// No per-day summary otherwise — decided 2026-08-12 that per-activity daily totals were unwanted noise;
// the only running total left is the bottom-of-sheet pay-period summary.
interface ClockInOutDayManifest {
  date: string;
  dayHeaderRow: number;
  columnHeaderRow: number;
  slotRows: ClockInOutSlotRowManifest[];
  flatRateSectionLabelRow?: number;
  flatRateRows: ClockInOutFlatRateRowManifest[];
}

// One week's column group in a ClockInOut timesheet: weeks sit side by side sharing row numbers, rather
// than stacking — labelColumnIndex is the 0-based sheet column where this week's 4-column group (label/
// In/Out/Total) starts. Every week has the same day count and the same flat-rate activities (both are
// pay-period/employee-wide, not per-week), so weekLabelRow and every day's row numbers are identical
// across every week in clockInOutWeeks — only labelColumnIndex and the cell content differ.
interface ClockInOutWeekManifest {
  weekIndex: number;
  labelColumnIndex: number;
  weekLabelRow: number;
  days: ClockInOutDayManifest[];
}

interface TimesheetManifest {
  payPeriodId: Guid;
  employeeId: Guid;
  generatedAt: string;
  tabName: string;
  weeks: WeekManifest[];
  employeeSignatureCell: SignatureCell;
  supervisorSignatureCell: SignatureCell;
  includeInPayrollCell: SignatureCell;
  summaryRows: SummaryRowManifest[];
  // Set instead of weeks when the client's timeInputMethod is ClockInOut — weeks is left empty in that
  // case. A timesheet is consistently one shape or the other, never both.
  clockInOutWeeks?: ClockInOutWeekManifest[];
}

export type {
  DateColumnManifest,
  ActivityRowManifest,
  WeekManifest,
  SignatureCell,
  SummaryRowManifest,
  ClockInOutSlotRowManifest,
  ClockInOutDayManifest,
  ClockInOutFlatRateRowManifest,
  ClockInOutWeekManifest,
};
export default TimesheetManifest;
