import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeValues from '#db/adapter/writeValues.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import { ALLOCATION_REPORT_TAB, ALLOCATION_REPORT_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

// Overwrites the AllocationReport tab with the current allocation data. No history — safe to call repeatedly.
const writeAllocationReportTab = async (
  workbookId: string,
  rows: AllocationReportRow[],
): Promise<void> => {
  logger.debug(`writeAllocationReportTab workbook=${workbookId} count=${rows.length}`);
  await createTabIfNotExists(workbookId, ALLOCATION_REPORT_TAB);
  const values: unknown[][] = [
    ALLOCATION_REPORT_HEADERS,
    ...rows.map((row) => [row.fundingSourceName, row.wagesAllocation, row.additionalExpenses, row.total]),
  ];
  await writeValues(workbookId, ALLOCATION_REPORT_TAB, values);
};

export default writeAllocationReportTab;
