import { TimesheetFolderStatusType } from '#models/TimesheetFolderStatus.js';

// All fields optional — only send what's actually changing. driveFolderLink, if provided, is
// re-parsed and re-verified via folderExists before being stored as driveFolderId.
interface TimesheetFolderUpdateRequest {
  timesheetFolderName?: string;
  driveFolderLink?: string;
  status?: TimesheetFolderStatusType;
}

export default TimesheetFolderUpdateRequest;
