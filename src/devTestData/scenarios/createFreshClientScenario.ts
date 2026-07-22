import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';
import {
  DEV_TEST_DATA_FRESH_CLIENT_CODE,
  DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
} from '../constants.js';
import type DevTestDataScenarioSummary from '../types/DevTestDataScenarioSummary.js';
import buildFreshClientRequest from './buildFreshClientRequest.js';

const createFreshClientScenario = async (
  testDataRootFolderId: string,
): Promise<DevTestDataScenarioSummary> => {
  const freshClientFolderId = await createFolder(
    DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
    testDataRootFolderId,
  );

  const freshClientRequest = buildFreshClientRequest(
    buildDriveFolderLink(freshClientFolderId),
  );
  await createClient(freshClientRequest);

  return {
    scenario: DEV_TEST_DATA_FRESH_CLIENT_FOLDER_NAME,
    folderId: freshClientFolderId,
    clientCode: DEV_TEST_DATA_FRESH_CLIENT_CODE,
  };
};

export default createFreshClientScenario;
