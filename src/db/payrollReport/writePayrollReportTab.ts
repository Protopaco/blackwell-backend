import createTabIfNotExists from '#db/adapter/createTabIfNotExists.js';
import writeValues from '#db/adapter/writeValues.js';
import { logger } from '#utils/logger.js';

// Creates a tab (if not exists) and writes a 2D array of values to it using USER_ENTERED input option.
// Used to write pending_hours and pending_adp_summary before renaming to current_hours/current_adp_summary.
const writePayrollReportTab = async (
  workbookId: string,
  tabName: string,
  values: unknown[][],
): Promise<void> => {
  logger.debug(`writePayrollReportTab tab=${tabName} workbook=${workbookId}`);
  await createTabIfNotExists(workbookId, tabName);
  await writeValues(workbookId, tabName, values);
};

export default writePayrollReportTab;
