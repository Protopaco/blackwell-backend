import readTab from '#db/adapter/readTab.js';
import { TIMESHEET_FOLDERS_TAB } from '#config/constants.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import mapTimesheetFolder from '#db/timesheetFolder/mapTimesheetFolder.js';

// Reads all timesheet folders from the TimesheetFolders tab of a client's payroll config file.
const readTimesheetFolders = async (payrollConfigFileId: string): Promise<TimesheetFolder[]> => {
  const rows = await readTab(payrollConfigFileId, TIMESHEET_FOLDERS_TAB);
  return rows.map(mapTimesheetFolder);
};

export default readTimesheetFolders;
