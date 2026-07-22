import { TimesheetFolderStatusType } from '#models/TimesheetFolderStatus.js';

// All fields optional — only send what's actually changing. Drive folder links are immutable after creation.
interface TimesheetFolderUpdateRequest {
  timesheetFolderName?: string;
  status?: TimesheetFolderStatusType;
}

export default TimesheetFolderUpdateRequest;
