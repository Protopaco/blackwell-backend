import createFolder from '#db/adapter/createFolder.js';
import { logger } from '#utils/logger.js';
import {
  DEV_TEST_DATA_CONFIGURED_CLIENT_CODE,
  DEV_TEST_DATA_EARLY_CLIENT_CODE,
  DEV_TEST_DATA_FRESH_CLIENT_CODE,
  DEV_TEST_DATA_ROOT_FOLDER_NAME,
} from './constants.js';
import getDevTestDataParentFolderId from './getDevTestDataParentFolderId.js';
import purgeDevTestData from './purgeDevTestData.js';
import createConfiguredClientScenario from './scenarios/createConfiguredClientScenario.js';
import createEarlyClientScenario from './scenarios/createEarlyClientScenario.js';
import createFreshClientScenario from './scenarios/createFreshClientScenario.js';
import type ResetDevTestDataResult from './types/ResetDevTestDataResult.js';

const resetDevTestData = async (): Promise<ResetDevTestDataResult> => {
  logger.info('Resetting dev test data');

  const purge = await purgeDevTestData();
  const testDataRootFolderId = await createFolder(
    DEV_TEST_DATA_ROOT_FOLDER_NAME,
    getDevTestDataParentFolderId(),
  );
  const freshClient = await createFreshClientScenario(testDataRootFolderId);
  const configuredClient = await createConfiguredClientScenario(testDataRootFolderId);
  const earlyClient = await createEarlyClientScenario(testDataRootFolderId);

  return {
    purge,
    testDataRootFolderId,
    scenarios: [freshClient, configuredClient, earlyClient],
    clients: {
      writtenClientCodes: [
        DEV_TEST_DATA_FRESH_CLIENT_CODE,
        DEV_TEST_DATA_CONFIGURED_CLIENT_CODE,
        DEV_TEST_DATA_EARLY_CLIENT_CODE,
      ],
    },
  };
};

export default resetDevTestData;
