import TimesheetEntryInput from './TimesheetEntryInput.js';

type FillGeneratedTimesheetInput = {
  timesheetFileId: string;
  payPeriodId: string;
  tabName: string;
  entries?: TimesheetEntryInput[];
  employeeSigned?: boolean;
  supervisorSigned?: boolean;
};

export default FillGeneratedTimesheetInput;
