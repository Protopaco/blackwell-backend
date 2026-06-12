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
  dates: DateColumnManifest[];
  activityRows: ActivityRowManifest[];
}

interface SignatureCell {
  row: number;
  column: number;
}

interface TimesheetManifest {
  payPeriodId: Guid;
  employeeId: Guid;
  generatedAt: string;
  tabName: string;
  weeks: WeekManifest[];
  employeeSignatureCell: SignatureCell;
  supervisorSignatureCell: SignatureCell;
}

export type { DateColumnManifest, ActivityRowManifest, WeekManifest, SignatureCell };
export default TimesheetManifest;
