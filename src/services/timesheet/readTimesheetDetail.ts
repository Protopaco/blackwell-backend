import readTabValues from '#db/adapter/readTabValues.js';
import readManifest from '#db/manifest/readManifest.js';
import { logger } from '#utils/logger.js';

interface TimesheetDetail {
  totalHours: number | null;
  flatRateQuantity: number | null;
  employeeSigned: boolean;
  supervisorSigned: boolean;
}

// Reads a single timesheet tab and returns total hours and whether each signature cell is filled.
// Returns null totalHours and false for both signed flags if the timesheet has not been generated.
// Called once per employee by getTimesheetStatuses — reads tab values once and extracts all three values from that single call.
const readTimesheetDetail = async (
  timesheetFileId: string,
  tabName: string,
): Promise<TimesheetDetail> => {
  const notGenerated: TimesheetDetail = {
    totalHours: null,
    flatRateQuantity: null,
    employeeSigned: false,
    supervisorSigned: false,
  };

  if (!timesheetFileId) return notGenerated;

  const manifest = await readManifest(timesheetFileId, tabName);
  if (!manifest) return notGenerated;

  const { employeeSignatureCell, supervisorSignatureCell, summaryRows } = manifest;
  if (!employeeSignatureCell || !supervisorSignatureCell) return notGenerated;

  logger.debug(`readTimesheetDetail reading tab values: ${tabName}`);
  const rows = await readTabValues(timesheetFileId, tabName);

  const employeeSigned = Boolean(rows[employeeSignatureCell.row - 1]?.[employeeSignatureCell.column - 1]);
  const supervisorSigned = Boolean(rows[supervisorSignatureCell.row - 1]?.[supervisorSignatureCell.column - 1]);

  const totalHoursManifestRow = summaryRows?.find((summaryRow) => summaryRow.label === 'Total Hours Worked');
  const totalHoursRawValue = totalHoursManifestRow
    ? rows[totalHoursManifestRow.row - 1]?.[1]
    : undefined;
  const totalHours = totalHoursRawValue !== undefined && totalHoursRawValue !== ''
    ? Number(totalHoursRawValue)
    : 0;

  const flatRateQuantityManifestRow = summaryRows?.find((summaryRow) => summaryRow.label === 'Flat Rate Shifts');
  const flatRateQuantityRawValue = flatRateQuantityManifestRow
    ? rows[flatRateQuantityManifestRow.row - 1]?.[1]
    : undefined;
  const flatRateQuantity = flatRateQuantityManifestRow
    ? flatRateQuantityRawValue !== undefined && flatRateQuantityRawValue !== ''
      ? Number(flatRateQuantityRawValue)
      : 0
    : null;

  return { totalHours, flatRateQuantity, employeeSigned, supervisorSigned };
};

export type { TimesheetDetail };
export default readTimesheetDetail;
