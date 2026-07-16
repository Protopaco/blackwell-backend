import createFolder from '#db/adapter/createFolder.js';
import { DEV_TEST_DATA_TEMPLATE_ROOT_FOLDER_NAME } from './constants.js';
import createFreshClientScenario from './scenarios/createFreshClientScenario.js';
import type DevTestDataTemplateSummary from './types/DevTestDataTemplateSummary.js';

const createTemplates = async (
  templateParentFolderId: string,
): Promise<DevTestDataTemplateSummary[]> => {
  const templateRootFolderId = await createFolder(
    DEV_TEST_DATA_TEMPLATE_ROOT_FOLDER_NAME,
    templateParentFolderId,
  );

  const freshClientTemplate = await createFreshClientScenario(templateRootFolderId);
  return [freshClientTemplate];
};

export default createTemplates;
