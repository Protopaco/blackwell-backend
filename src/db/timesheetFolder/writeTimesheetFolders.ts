import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readTimesheetFolders from '#db/timesheetFolder/readTimesheetFolders.js';
import { TIMESHEET_FOLDERS_TAB, TIMESHEET_FOLDERS_HEADERS } from '#config/constants.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all timesheet folder rows, updating the one matching the given timesheet folder.
const writeTimesheetFolders = async (
  payrollConfigFileId: string,
  updatedTimesheetFolder: TimesheetFolder,
): Promise<void> => {
  const timesheetFolders = await readTimesheetFolders(payrollConfigFileId);

  const index = timesheetFolders.findIndex(
    (timesheetFolder) => timesheetFolder.timesheetFolderId === updatedTimesheetFolder.timesheetFolderId,
  );
  if (index === -1) {
    throw new NotFoundError(`TimesheetFolder not found: ${updatedTimesheetFolder.timesheetFolderId}`);
  }

  timesheetFolders[index] = updatedTimesheetFolder;

  const rows = timesheetFolders.map((timesheetFolder) => ({
    TimesheetFolderId: timesheetFolder.timesheetFolderId,
    TimesheetFolderName: timesheetFolder.timesheetFolderName,
    DriveFolderId: timesheetFolder.driveFolderId,
    Status: timesheetFolder.status,
  }));

  await overwriteTabRows(payrollConfigFileId, TIMESHEET_FOLDERS_TAB, TIMESHEET_FOLDERS_HEADERS, rows);
};

export default writeTimesheetFolders;
