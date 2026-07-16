import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';
import {
  DEV_TEST_DATA_CONFIGURED_CLIENT_CODE,
  DEV_TEST_DATA_CONFIGURED_CLIENT_FOLDER_NAME,
} from '../constants.js';
import type DevTestDataScenarioSummary from '../types/DevTestDataScenarioSummary.js';
import buildConfiguredClientRequest from './buildConfiguredClientRequest.js';
import createConfiguredClientSetup from './createConfiguredClientSetup.js';

const createConfiguredClientScenario = async (
  testDataRootFolderId: string,
): Promise<DevTestDataScenarioSummary> => {
  const configuredClientFolderId = await createFolder(
    DEV_TEST_DATA_CONFIGURED_CLIENT_FOLDER_NAME,
    testDataRootFolderId,
  );

  const configuredClientRequest = buildConfiguredClientRequest(
    buildDriveFolderLink(configuredClientFolderId),
  );
  const client = await createClient(configuredClientRequest);
  await createConfiguredClientSetup(client);

  return {
    scenario: DEV_TEST_DATA_CONFIGURED_CLIENT_FOLDER_NAME,
    folderId: configuredClientFolderId,
    clientCode: DEV_TEST_DATA_CONFIGURED_CLIENT_CODE,
  };
};

export default createConfiguredClientScenario;
