import writeTimesheetFolders from '#db/timesheetFolder/writeTimesheetFolders.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import parseDriveLink from '#utils/parseDriveLink.js';
import folderExists from '#db/adapter/folderExists.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import TimesheetFolderUpdateRequest from '#models/TimesheetFolderUpdateRequest.js';
import { logger } from '#utils/logger.js';
import { NotFoundError } from '#utils/errors.js';

// Updates only the fields provided — timesheetFolderName, driveFolderLink (re-parsed and re-verified
// if given), and/or status. Everything else is kept as-is.
const updateTimesheetFolder = async (
  clientId: string,
  timesheetFolderId: string,
  request: TimesheetFolderUpdateRequest,
): Promise<void> => {
  logger.info(`updateTimesheetFolder clientId=${clientId} timesheetFolderId=${timesheetFolderId}`);

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const existing = payrollConfig.timesheetFolders.find(
    (timesheetFolder) => timesheetFolder.timesheetFolderId === timesheetFolderId,
  );
  if (!existing) throw new NotFoundError(`TimesheetFolder not found: ${timesheetFolderId}`);

  let driveFolderId = existing.driveFolderId;
  if (request.driveFolderLink) {
    driveFolderId = parseDriveLink(request.driveFolderLink);
    const exists = await folderExists(driveFolderId);
    if (!exists) throw new NotFoundError(`Folder not found or inaccessible: ${request.driveFolderLink}`);
  }

  const updatedTimesheetFolder: TimesheetFolder = {
    ...existing,
    timesheetFolderName: request.timesheetFolderName ?? existing.timesheetFolderName,
    driveFolderId,
    status: request.status ?? existing.status,
  };

  await writeTimesheetFolders(client.payrollConfigFileId, updatedTimesheetFolder);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateTimesheetFolder;
