import createFolder from '#db/adapter/createFolder.js';
import getDevTestDataParentFolderId from './getDevTestDataParentFolderId.js';
import { DEV_TEST_DATA_ROOT_FOLDER_NAME } from './constants.js';

const createDevTestDataRoot = async (): Promise<string> => {
  return createFolder(DEV_TEST_DATA_ROOT_FOLDER_NAME, getDevTestDataParentFolderId());
};

export default createDevTestDataRoot;
