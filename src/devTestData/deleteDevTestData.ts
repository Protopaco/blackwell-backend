import findDriveFolderByName from '#db/adapter/findDriveFolderByName.js';
import trashDriveFile from '#db/adapter/trashDriveFile.js';
import readClients from '#db/client/readClients.js';
import replaceClients from '#db/client/replaceClients.js';
import clientsCache from '#utils/caches/clientsCache.js';
import { logger } from '#utils/logger.js';
import getDevTestDataParentFolderId from './getDevTestDataParentFolderId.js';
import {
  DEV_TEST_DATA_CLIENT_CODE_PREFIX,
  DEV_TEST_DATA_ROOT_FOLDER_NAME,
} from './constants.js';

const deleteDevTestData = async (): Promise<void> => {
  logger.info('deleteDevTestData');

  const parentFolderId = getDevTestDataParentFolderId();
  const rootFolderId = await findDriveFolderByName(parentFolderId, DEV_TEST_DATA_ROOT_FOLDER_NAME);
  if (rootFolderId) {
    await trashDriveFile(rootFolderId);
  }

  const clients = await readClients();
  const retainedClients = clients.filter(
    (client) => !client.clientCode.startsWith(DEV_TEST_DATA_CLIENT_CODE_PREFIX),
  );

  if (retainedClients.length !== clients.length) {
    await replaceClients(retainedClients);
  }

  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (clientConfigFileId) clientsCache.delete(clientConfigFileId);
};

export default deleteDevTestData;
