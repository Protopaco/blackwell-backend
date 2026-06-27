import tabExists from '#db/adapter/tabExists.js';
import renameTab from '#db/adapter/renameTab.js';
import { logger } from '#utils/logger.js';

// Renames a tab to an archive name if it exists — silently does nothing if the tab is not found.
// Used to archive current_hours and current_adp_summary before writing a new run.
const archivePayrollReportTab = async (
  workbookId: string,
  currentTabName: string,
  archiveTabName: string,
): Promise<void> => {
  const exists = await tabExists(workbookId, currentTabName);
  if (!exists) {
    logger.debug(`archivePayrollReportTab: tab not found, skipping — ${currentTabName}`);
    return;
  }
  logger.debug(`archivePayrollReportTab: ${currentTabName} → ${archiveTabName}`);
  await renameTab(workbookId, currentTabName, archiveTabName);
};

export default archivePayrollReportTab;
