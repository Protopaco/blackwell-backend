import TimesheetFolder from '#models/TimesheetFolder.js';
import { TimesheetFolderStatusType } from '#models/TimesheetFolderStatus.js';

// Converts a raw TimesheetFolders sheet row into a TimesheetFolder model.
const mapTimesheetFolder = (row: Record<string, unknown>): TimesheetFolder => ({
  timesheetFolderId: row['TimesheetFolderId'] as string,
  timesheetFolderName: row['TimesheetFolderName'] as string,
  driveFolderId: row['DriveFolderId'] as string,
  status: row['Status'] as TimesheetFolderStatusType,
});

export default mapTimesheetFolder;
