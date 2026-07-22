import readTabValuesBatch from '#db/adapter/readTabValuesBatch.js';
import findManifestEntry from '#db/manifest/findManifestEntry.js';
import { MANIFEST_TAB } from '#config/constants.js';
import TimesheetDetail from '#models/TimesheetDetail.js';
import { TabNotFoundError } from '#utils/errors.js';
import { logger } from '#utils/logger.js';

// A real Sheets checkbox can come back as the boolean `false` or the string "FALSE" — unlike the
// signature cells (any non-empty string counts as signed), includeInPayroll defaults to true and is
// only false when explicitly unchecked, so treat everything else (including a blank/undefined cell) as true.
const readCheckboxValue = (raw: unknown): boolean => raw !== false && raw !== 'FALSE' && raw !== 'false';

// Reads a single timesheet tab straight from Sheets and returns total hours and whether each signature
// cell is filled. Returns null totalHours, false for both signed flags, and includeInPayroll true
// (default) if the timesheet has not been generated. Called by readTimesheetDetail on a cache miss —
// use that instead of this directly so reads benefit from the modifiedTime cache.
const readTimesheetDetailFromSheets = async (
  timesheetFileId: string,
  tabName: string,
): Promise<TimesheetDetail> => {
  const notGenerated: TimesheetDetail = {
    totalHours: null,
    flatRateQuantity: null,
    employeeSigned: false,
    supervisorSigned: false,
    includeInPayroll: true,
  };

  if (!timesheetFileId) return notGenerated;

  logger.debug(`readTimesheetDetailFromSheets reading manifest + tab values in one batch: ${tabName}`);
  let manifestRows: unknown[][];
  let rows: unknown[][];
  try {
    [manifestRows, rows] = await readTabValuesBatch(timesheetFileId, [MANIFEST_TAB, tabName]);
  } catch (error) {
    // A missing tab is the expected shape for an employee whose manifest, or this specific pay-period
    // tab, was never generated. Anything else (429 quota, 5xx, auth) is a real failure and must
    // propagate rather than being reported as "not generated," which would misrepresent the employee's
    // actual timesheet status.
    if (!(error instanceof TabNotFoundError)) throw error;
    return notGenerated;
  }

  const manifest = findManifestEntry(manifestRows, tabName);
  if (!manifest) return notGenerated;

  const { employeeSignatureCell, supervisorSignatureCell, includeInPayrollCell, summaryRows } = manifest;
  if (!employeeSignatureCell || !supervisorSignatureCell) return notGenerated;

  const employeeSigned = Boolean(rows[employeeSignatureCell.row - 1]?.[employeeSignatureCell.column - 1]);
  const supervisorSigned = Boolean(rows[supervisorSignatureCell.row - 1]?.[supervisorSignatureCell.column - 1]);

  // Older manifests predate includeInPayrollCell (no migration performed) — default to true.
  const includeInPayroll = includeInPayrollCell
    ? readCheckboxValue(rows[includeInPayrollCell.row - 1]?.[includeInPayrollCell.column - 1])
    : true;

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

  return { totalHours, flatRateQuantity, employeeSigned, supervisorSigned, includeInPayroll };
};

export default readTimesheetDetailFromSheets;
