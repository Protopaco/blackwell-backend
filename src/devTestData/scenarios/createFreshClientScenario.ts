import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';
import {
  DEV_TEST_DATA_FRESH_CLIENT_CODE,
  DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
} from '../constants.js';
import type DevTestDataTemplateSummary from '../types/DevTestDataTemplateSummary.js';
import buildFreshClientTemplateRequest from './freshClientTemplate.js';

const createFreshClientScenario = async (
  templateRootFolderId: string,
): Promise<DevTestDataTemplateSummary> => {
  const freshClientFolderId = await createFolder(
    DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
    templateRootFolderId,
  );

  const freshClientTemplateRequest = buildFreshClientTemplateRequest(
    buildDriveFolderLink(freshClientFolderId),
  );
  await createClient(freshClientTemplateRequest);

  return {
    scenario: DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
    folderId: freshClientFolderId,
    clientCode: DEV_TEST_DATA_FRESH_CLIENT_CODE,
  };
};

export default createFreshClientScenario;
