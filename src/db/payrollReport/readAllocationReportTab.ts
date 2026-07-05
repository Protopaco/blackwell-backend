import readTab from '#db/adapter/readTab.js';
import { ALLOCATION_REPORT_TAB, ALLOCATION_REPORT_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';
import allocationReportCache from '#utils/caches/allocationReportCache.js';
import AllocationReportRow from '#models/AllocationReportRow.js';

const [fundingSourceName, wagesAllocation, additionalExpenses, total] = ALLOCATION_REPORT_HEADERS;

// Reads all rows from the AllocationReport tab, cached for 5 minutes. Returns empty array if the tab doesn't exist yet.
const readAllocationReportTab = async (workbookId: string): Promise<AllocationReportRow[]> => {
  const cached = allocationReportCache.get(workbookId);
  if (cached) return cached;

  logger.debug(`readAllocationReportTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, ALLOCATION_REPORT_TAB);
    const allocationRows = rows.map((row) => ({
      fundingSourceName: row[fundingSourceName] as string,
      wagesAllocation: Number(row[wagesAllocation]),
      additionalExpenses: Number(row[additionalExpenses]),
      total: Number(row[total]),
    }));
    allocationReportCache.set(workbookId, allocationRows);
    return allocationRows;
  } catch {
    return [];
  }
};

export default readAllocationReportTab;
