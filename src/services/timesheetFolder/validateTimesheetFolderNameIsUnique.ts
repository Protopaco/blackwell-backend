import TimesheetFolder from '#models/TimesheetFolder.js';
import { UnprocessableError } from '#utils/errors.js';

export const normalizeTimesheetFolderName = (timesheetFolderName: string): string =>
  timesheetFolderName.trim().toLowerCase();

const validateTimesheetFolderNameIsUnique = (
  timesheetFolders: TimesheetFolder[],
  timesheetFolderName: string,
  excludedTimesheetFolderId?: string,
): void => {
  const normalizedName = normalizeTimesheetFolderName(timesheetFolderName);
  const duplicate = timesheetFolders.find(
    (timesheetFolder) =>
      timesheetFolder.timesheetFolderId !== excludedTimesheetFolderId &&
      normalizeTimesheetFolderName(timesheetFolder.timesheetFolderName) === normalizedName,
  );

  if (duplicate) {
    throw new UnprocessableError(
      `TimesheetFolder name already exists for this client: ${timesheetFolderName.trim()}`,
    );
  }
};

export default validateTimesheetFolderNameIsUnique;
