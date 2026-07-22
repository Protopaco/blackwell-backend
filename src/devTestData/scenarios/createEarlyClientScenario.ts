import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';
import {
  DEV_TEST_DATA_EARLY_CLIENT_CODE,
  DEV_TEST_DATA_EARLY_CLIENT_FOLDER_NAME,
} from '../constants.js';
import type DevTestDataScenarioSummary from '../types/DevTestDataScenarioSummary.js';
import buildEarlyClientRequest from './buildEarlyClientRequest.js';
import createConfiguredClientSetup from './createConfiguredClientSetup.js';
import createOpenPayPeriod from './createOpenPayPeriod.js';

const createEarlyClientScenario = async (
  testDataRootFolderId: string,
): Promise<DevTestDataScenarioSummary> => {
  const earlyClientFolderId = await createFolder(
    DEV_TEST_DATA_EARLY_CLIENT_FOLDER_NAME,
    testDataRootFolderId,
  );

  const earlyClientRequest = buildEarlyClientRequest(
    buildDriveFolderLink(earlyClientFolderId),
  );
  const client = await createClient(earlyClientRequest);

  await createConfiguredClientSetup(client);
  await createOpenPayPeriod(client.clientId);

  return {
    scenario: DEV_TEST_DATA_EARLY_CLIENT_FOLDER_NAME,
    folderId: earlyClientFolderId,
    clientCode: DEV_TEST_DATA_EARLY_CLIENT_CODE,
  };
};

export default createEarlyClientScenario;
