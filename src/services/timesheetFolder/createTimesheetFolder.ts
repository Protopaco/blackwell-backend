import appendTimesheetFolder from '#db/timesheetFolder/appendTimesheetFolder.js';
import getClientById from '#services/client/getClientById.js';
import parseDriveLink from '#utils/parseDriveLink.js';
import folderExists from '#db/adapter/folderExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import TimesheetFolderCreateRequest from '#models/TimesheetFolderCreateRequest.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Parses and verifies the given Drive link, assigns a new UUID, and appends a timesheet folder to
// the client's PayrollConfig. Always created Active.
const createTimesheetFolder = async (
  clientId: string,
  request: TimesheetFolderCreateRequest,
): Promise<void> => {
  logger.info(`createTimesheetFolder clientId=${clientId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const driveFolderId = parseDriveLink(request.driveFolderLink);
  const exists = await folderExists(driveFolderId);
  if (!exists) throw new NotFoundError(`Folder not found or inaccessible: ${request.driveFolderLink}`);

  const newTimesheetFolder: TimesheetFolder = {
    timesheetFolderId: crypto.randomUUID(),
    timesheetFolderName: request.timesheetFolderName,
    driveFolderId,
    status: TimesheetFolderStatus.Active,
  };

  await appendTimesheetFolder(client.payrollConfigFileId, newTimesheetFolder);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default createTimesheetFolder;
