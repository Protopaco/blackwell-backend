const DEV_TEST_DATA_ROOT_FOLDER_NAME = 'UI_TEST_DATA';
const DEV_TEST_DATA_CLIENT_CODE_PREFIX = 'UI_TEST_';

type DevTestDataPurgeTarget = {
  folderName: string;
  clientCodePrefix: string;
};

const UI_DEV_TEST_DATA_PURGE_TARGET: DevTestDataPurgeTarget = {
  folderName: DEV_TEST_DATA_ROOT_FOLDER_NAME,
  clientCodePrefix: DEV_TEST_DATA_CLIENT_CODE_PREFIX,
};

export {
  DEV_TEST_DATA_ROOT_FOLDER_NAME,
  DEV_TEST_DATA_CLIENT_CODE_PREFIX,
  UI_DEV_TEST_DATA_PURGE_TARGET,
};
export type { DevTestDataPurgeTarget };
