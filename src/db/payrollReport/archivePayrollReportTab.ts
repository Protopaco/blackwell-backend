import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import { logger } from '#utils/logger.js';

// Renames a tab to an archive name if it exists — silently does nothing if the tab is not found.
// Used to archive current_hours and current_adp_summary before writing a new run.
const archivePayrollReportTab = async (
  workbookId: string,
  currentTabName: string,
  archiveTabName: string,
): Promise<void> => {
  const exists = await sheetsAdapter.tabExists(workbookId, currentTabName);
  if (!exists) {
    logger.debug(`archivePayrollReportTab: tab not found, skipping — ${currentTabName}`);
    return;
  }
  logger.debug(`archivePayrollReportTab: ${currentTabName} → ${archiveTabName}`);
  await sheetsAdapter.renameTab(workbookId, currentTabName, archiveTabName);
};

export default archivePayrollReportTab;
