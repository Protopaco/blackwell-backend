import createFolder from '#db/adapter/createFolder.js';
import createClient from '#services/client/createClient.js';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';
import {
  DEV_TEST_DATA_LATE_CLIENT_CODE,
  DEV_TEST_DATA_LATE_CLIENT_FOLDER_NAME,
} from '../constants.js';
import type DevTestDataScenarioSummary from '../types/DevTestDataScenarioSummary.js';
import buildLateClientRequest from './buildLateClientRequest.js';
import createClosedPayPeriod from './createClosedPayPeriod.js';
import createConfiguredClientSetup from './createConfiguredClientSetup.js';
import createOpenPayPeriod from './createOpenPayPeriod.js';
import createPendingPayPeriod from './createPendingPayPeriod.js';
import createProcessedPayPeriod from './createProcessedPayPeriod.js';

const createLateClientScenario = async (
  testDataRootFolderId: string,
): Promise<DevTestDataScenarioSummary> => {
  const lateClientFolderId = await createFolder(
    DEV_TEST_DATA_LATE_CLIENT_FOLDER_NAME,
    testDataRootFolderId,
  );

  const lateClientRequest = buildLateClientRequest(
    buildDriveFolderLink(lateClientFolderId),
  );
  const client = await createClient(lateClientRequest);

  await createConfiguredClientSetup(client);
  await createClosedPayPeriod(client);
  await createProcessedPayPeriod(client);
  await createOpenPayPeriod(client.clientId);
  await createPendingPayPeriod(client.clientId);

  return {
    scenario: DEV_TEST_DATA_LATE_CLIENT_FOLDER_NAME,
    folderId: lateClientFolderId,
    clientCode: DEV_TEST_DATA_LATE_CLIENT_CODE,
  };
};

export default createLateClientScenario;
