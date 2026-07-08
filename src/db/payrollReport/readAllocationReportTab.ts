import readTab from '#db/adapter/readTab.js';
import tabExists from '#db/adapter/tabExists.js';
import { ALLOCATION_REPORT_TAB, ALLOCATION_REPORT_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import allocationReportCache from '#utils/caches/allocationReportCache.js';
import AllocationReportRow from '#models/AllocationReportRow.js';

const [fundingSourceName, wagesAllocation, additionalExpenses, total] = ALLOCATION_REPORT_HEADERS;

// Reads all rows from the AllocationReport tab, cached for 5 minutes. Returns null if the tab doesn't
// exist yet, or an empty array if it exists but has no rows.
const readAllocationReportTab = async (workbookId: string): Promise<AllocationReportRow[] | null> => {
  const cached = allocationReportCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readAllocationReportTab workbook=${workbookId}`);

  const exists = await tabExists(workbookId, ALLOCATION_REPORT_TAB);
  if (!exists) return null;

  const rows = await readTab(workbookId, ALLOCATION_REPORT_TAB);
  const allocationRows = rows.map((row) => ({
    fundingSourceName: row[fundingSourceName] as string,
    wagesAllocation: Number(row[wagesAllocation]),
    additionalExpenses: Number(row[additionalExpenses]),
    total: Number(row[total]),
  }));
  allocationReportCache.set(workbookId, allocationRows);
  return allocationRows;
};

export default readAllocationReportTab;
