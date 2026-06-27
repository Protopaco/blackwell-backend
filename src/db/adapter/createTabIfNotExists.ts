import createTab from './createTab.js';
import tabExists from './tabExists.js';
import deleteTab from './deleteTab.js';
import { logger } from '#utils/logger.js';

// Creates a tab only if it doesn't already exist — safe to call unconditionally when writing timesheet or manifest tabs.
// Also removes the default Sheet1 that Google adds to every new workbook, if it still exists after the new tab is created.
const createTabIfNotExists = async (workbookId: string, tabName: string): Promise<void> => {
  try {
    await createTab(workbookId, tabName);
  } catch (error: any) {
    const alreadyExists = error?.errors?.[0]?.reason === 'badRequest' &&
      error?.message?.includes('already exists');
    if (!alreadyExists) throw error;
    logger.debug(`Tab already exists, skipping create: ${tabName}`);
  }

  if (tabName !== 'Sheet1') {
    const defaultSheetExists = await tabExists(workbookId, 'Sheet1');
    if (defaultSheetExists) {
      logger.debug(`Removing default Sheet1 from workbook: ${workbookId}`);
      await deleteTab(workbookId, 'Sheet1');
    }
  }
};

export default createTabIfNotExists;
