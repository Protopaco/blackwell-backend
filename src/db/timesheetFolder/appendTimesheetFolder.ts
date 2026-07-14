import appendRow from '#db/adapter/appendRow.js';
import { TIMESHEET_FOLDERS_TAB, TIMESHEET_FOLDERS_HEADERS } from '#config/constants.js';
import TimesheetFolder from '#models/TimesheetFolder.js';

// Appends a new timesheet folder row to the TimesheetFolders tab.
const appendTimesheetFolder = async (
  payrollConfigFileId: string,
  timesheetFolder: TimesheetFolder,
): Promise<void> => {
  const row: Record<string, unknown> = {
    TimesheetFolderId: timesheetFolder.timesheetFolderId,
    TimesheetFolderName: timesheetFolder.timesheetFolderName,
    DriveFolderId: timesheetFolder.driveFolderId,
    Status: timesheetFolder.status,
  };

  await appendRow(payrollConfigFileId, TIMESHEET_FOLDERS_TAB, TIMESHEET_FOLDERS_HEADERS, row);
};

export default appendTimesheetFolder;
