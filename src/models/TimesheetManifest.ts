import Guid from './Guid.js';

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
  dateRow: number;
  dailyTotalRow: number;
  dates: DateColumnManifest[];
  activityRows: ActivityRowManifest[];
  flatRateRows: ActivityRowManifest[];
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
  summaryRows: SummaryRowManifest[];
}

export type { DateColumnManifest, ActivityRowManifest, WeekManifest, SignatureCell, SummaryRowManifest };
export default TimesheetManifest;
