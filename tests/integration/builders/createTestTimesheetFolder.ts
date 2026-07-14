import createFolder from '#db/adapter/createFolder.js';
import appendTimesheetFolder from '#db/timesheetFolder/appendTimesheetFolder.js';
import Client from '#models/Client.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import payrollConfigCache from '#utils/caches/payrollConfigCache.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestTimesheetFolder = async (
  client: Client,
  overrides: Partial<TimesheetFolder> = {},
): Promise<TimesheetFolder> => {
  const uniqueCode = getUniqueCode('TSFOLDER');
  const driveFolderId = overrides.driveFolderId ??
    await createFolder(`Timesheet Folder ${uniqueCode}`, client.employeePayrollFolderId);

  const timesheetFolder: TimesheetFolder = {
    timesheetFolderId: crypto.randomUUID(),
    timesheetFolderName: `Timesheet Folder ${uniqueCode}`,
    driveFolderId,
    status: TimesheetFolderStatus.Active,
    ...overrides,
  };

  await appendTimesheetFolder(client.payrollConfigFileId, timesheetFolder);
  payrollConfigCache.delete(client.payrollConfigFileId);

  return timesheetFolder;
};

export default createTestTimesheetFolder;
