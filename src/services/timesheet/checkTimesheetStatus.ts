import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import readManifest from '#db/manifest/readManifest.js';
import { TimesheetStatus, TimesheetStatusType } from '#models/TimesheetStatus.js';
import { logger } from '#utils/logger.js';

const EMPLOYEE_SIGNATURE_COLUMN = 'B';
const SUPERVISOR_SIGNATURE_COLUMN = 'B';

const checkTimesheetStatus = async (
  timesheetFileId: string,
  tabName: string,
): Promise<TimesheetStatusType> => {
  logger.info(`checkTimesheetStatus timesheetFileId=${timesheetFileId} tabName=${tabName}`);

  const manifest = await readManifest(timesheetFileId, tabName);
  if (!manifest) return TimesheetStatus.NotGenerated;

  const rows = await sheetsAdapter.readTab(timesheetFileId, tabName);
  if (rows.length === 0) return TimesheetStatus.Generated;

  const employeeSignatureRow = rows.find((row) =>
    String(row[''] || '').toLowerCase().includes('employee signature'),
  );
  const supervisorSignatureRow = rows.find((row) =>
    String(row[''] || '').toLowerCase().includes('supervisor signature'),
  );

  const supervisorSigned = supervisorSignatureRow && supervisorSignatureRow[SUPERVISOR_SIGNATURE_COLUMN];
  const employeeSigned = employeeSignatureRow && employeeSignatureRow[EMPLOYEE_SIGNATURE_COLUMN];

  if (supervisorSigned) return TimesheetStatus.Approved;
  if (employeeSigned) return TimesheetStatus.Submitted;
  return TimesheetStatus.Generated;
};

export default checkTimesheetStatus;
