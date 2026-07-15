import TimesheetEntryInput from './TimesheetEntryInput.js';

interface FillGeneratedTimesheetInput {
  timesheetFileId: string;
  payPeriodId: string;
  tabName: string;
  entries?: TimesheetEntryInput[];
  employeeSigned?: boolean;
  supervisorSigned?: boolean;
}

export default FillGeneratedTimesheetInput;
