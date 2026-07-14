import Guid from '#models/Guid.js';
import { TimesheetFolderStatusType } from '#models/TimesheetFolderStatus.js';

interface TimesheetFolder {
  timesheetFolderId: Guid;
  timesheetFolderName: string;
  driveFolderId: string;
  status: TimesheetFolderStatusType;
}

export default TimesheetFolder;
