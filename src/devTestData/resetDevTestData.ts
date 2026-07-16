import createFolder from '#db/adapter/createFolder.js';
import { logger } from '#utils/logger.js';
import {
  DEV_TEST_DATA_FRESH_CLIENT_CODE,
  DEV_TEST_DATA_ROOT_FOLDER_NAME,
} from './constants.js';
import getDevTestDataParentFolderId from './getDevTestDataParentFolderId.js';
import purgeDevTestData from './purgeDevTestData.js';
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

  return {
    purge,
    testDataRootFolderId,
    scenarios: [freshClient],
    clients: {
      writtenClientCode: DEV_TEST_DATA_FRESH_CLIENT_CODE,
    },
  };
};

export default resetDevTestData;
