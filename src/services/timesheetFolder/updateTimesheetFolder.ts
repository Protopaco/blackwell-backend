import writeTimesheetFolders from '#db/timesheetFolder/writeTimesheetFolders.js';
import readPayrollConfig from '#db/payrollConfig/readPayrollConfig.js';
import getClientById from '#services/client/getClientById.js';
import validateTimesheetFolderNameIsUnique from '#services/timesheetFolder/validateTimesheetFolderNameIsUnique.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import TimesheetFolderUpdateRequest from '#models/TimesheetFolderUpdateRequest.js';
import { logger } from '#utils/logger.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

// Updates only the fields provided — timesheetFolderName and/or status. The Drive folder is immutable
// after creation so historical employee placement remains auditable.
const updateTimesheetFolder = async (
  clientId: string,
  timesheetFolderId: string,
  request: TimesheetFolderUpdateRequest,
): Promise<void> => {
  logger.info(`updateTimesheetFolder clientId=${clientId} timesheetFolderId=${timesheetFolderId}`);

  if (Object.prototype.hasOwnProperty.call(request, 'driveFolderLink')) {
    throw new UnprocessableError('driveFolderLink cannot be changed after TimesheetFolder creation');
  }

  const client = await getClientById(clientId);
  if (!client) throw new NotFoundError(`Client not found: ${clientId}`);

  const payrollConfig = await readPayrollConfig(client.payrollConfigFileId);
  const existing = payrollConfig.timesheetFolders.find(
    (timesheetFolder) => timesheetFolder.timesheetFolderId === timesheetFolderId,
  );
  if (!existing) throw new NotFoundError(`TimesheetFolder not found: ${timesheetFolderId}`);

  const timesheetFolderName = request.timesheetFolderName?.trim() ?? existing.timesheetFolderName;
  if (request.timesheetFolderName !== undefined) {
    validateTimesheetFolderNameIsUnique(
      payrollConfig.timesheetFolders,
      timesheetFolderName,
      timesheetFolderId,
    );
  }

  const updatedTimesheetFolder: TimesheetFolder = {
    ...existing,
    timesheetFolderName,
    status: request.status ?? existing.status,
  };

  await writeTimesheetFolders(client.payrollConfigFileId, updatedTimesheetFolder);
  payrollConfigCache.delete(client.payrollConfigFileId);
};

export default updateTimesheetFolder;
