import { logger } from '#utils/logger.js';
import { DEV_TEST_DATA_CLIENT_CODE_PREFIX } from './constants.js';
import createTemplates from './createTemplates.js';
import deleteTemplates from './deleteTemplates.js';
import removeDevTestClientRows from './removeDevTestClientRows.js';
import type BuildTestDataTemplatesResult from './types/BuildTestDataTemplatesResult.js';

const buildTestDataTemplates = async (): Promise<BuildTestDataTemplatesResult> => {
  const templateParentFolderId = process.env.TEST_DATA_TEMPLATE_FOLDER_ID;
  if (!templateParentFolderId) throw new Error('TEST_DATA_TEMPLATE_FOLDER_ID is not set');

  logger.info('Building dev test-data templates');

  const removedBeforeBuild = await deleteTemplates(templateParentFolderId);
  const templates = await createTemplates(templateParentFolderId);
  const removedAfterBuild = await removeDevTestClientRows(
    (clientCode) => clientCode.startsWith(DEV_TEST_DATA_CLIENT_CODE_PREFIX),
  );

  return {
    templates,
    clients: {
      removedTemporaryRows: removedBeforeBuild + removedAfterBuild.removedCount,
    },
  };
};

export default buildTestDataTemplates;
