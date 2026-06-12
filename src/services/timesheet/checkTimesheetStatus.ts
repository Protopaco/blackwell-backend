import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import readManifest from '#db/manifest/readManifest.js';
import { TimesheetStatus, TimesheetStatusType } from '#models/TimesheetStatus.js';
import { logger } from '#utils/logger.js';

const checkTimesheetStatus = async (
  timesheetFileId: string,
  tabName: string,
): Promise<TimesheetStatusType> => {
  logger.info(`checkTimesheetStatus timesheetFileId=${timesheetFileId} tabName=${tabName}`);

  if (!timesheetFileId) return TimesheetStatus.NotGenerated;

  const manifest = await readManifest(timesheetFileId, tabName);
  if (!manifest) return TimesheetStatus.NotGenerated;

  const { employeeSignatureCell, supervisorSignatureCell } = manifest;

  // Manifests generated before signature cells were added won't have these fields
  if (!employeeSignatureCell || !supervisorSignatureCell) return TimesheetStatus.Generated;

  // Read the full tab and index directly into the signature rows using manifest coordinates.
  // Reading specific cell ranges with special characters in the tab name causes Sheets API
  // parse errors, so we read the full tab and index into it instead.
  const rows = await sheetsAdapter.readTabValues(timesheetFileId, tabName);

  const employeeSigned = Boolean(rows[employeeSignatureCell.row - 1]?.[employeeSignatureCell.column - 1]);
  const supervisorSigned = Boolean(rows[supervisorSignatureCell.row - 1]?.[supervisorSignatureCell.column - 1]);

  if (employeeSigned && supervisorSigned) return TimesheetStatus.Complete;
  if (supervisorSigned) return TimesheetStatus.Approved;
  if (employeeSigned) return TimesheetStatus.Submitted;
  return TimesheetStatus.Generated;
};

export default checkTimesheetStatus;
