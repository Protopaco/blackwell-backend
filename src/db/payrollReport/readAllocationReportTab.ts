import readTab from '#db/adapter/readTab.js';
import AllocationReportRow from '#models/AllocationReportRow.js';
import { ALLOCATION_REPORT_TAB, ALLOCATION_REPORT_HEADERS } from '#config/constants.js';
import { logger } from '#utils/logger.js';

const [fundingSourceName, wagesAllocation, additionalExpenses, total] = ALLOCATION_REPORT_HEADERS;

// Reads all rows from the AllocationReport tab. Returns empty array if the tab doesn't exist yet.
const readAllocationReportTab = async (workbookId: string): Promise<AllocationReportRow[]> => {
  logger.debug(`readAllocationReportTab workbook=${workbookId}`);
  try {
    const rows = await readTab(workbookId, ALLOCATION_REPORT_TAB);
    return rows.map((row) => ({
      fundingSourceName: row[fundingSourceName] as string,
      wagesAllocation: Number(row[wagesAllocation]),
      additionalExpenses: Number(row[additionalExpenses]),
      total: Number(row[total]),
    }));
  } catch {
    return [];
  }
};

export default readAllocationReportTab;
