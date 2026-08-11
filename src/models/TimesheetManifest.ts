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
}

export type { DateColumnManifest, ActivityRowManifest, WeekManifest, SignatureCell, SummaryRowManifest };
export default TimesheetManifest;
