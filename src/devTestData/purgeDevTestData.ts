import findDriveFolderByName from '#db/adapter/findDriveFolderByName.js';
import trashDriveFile from '#db/adapter/trashDriveFile.js';
import readClients from '#db/client/readClients.js';
import replaceClients from '#db/client/replaceClients.js';
import clientsCache from '#utils/caches/clientsCache.js';
import { logger } from '#utils/logger.js';
import getDevTestDataParentFolderId from './getDevTestDataParentFolderId.js';
import {
  UI_DEV_TEST_DATA_PURGE_TARGET,
  type DevTestDataPurgeTarget,
} from './constants.js';

type PurgeDevTestDataResult = {
  driveFolder: {
    name: string;
    action: 'trashed' | 'not_found';
  };
  clients: {
    clientCodePrefix: string;
    action: 'removed' | 'unchanged';
    removedCount: number;
  };
};

const purgeDevTestData = async (
  target: DevTestDataPurgeTarget = UI_DEV_TEST_DATA_PURGE_TARGET,
): Promise<PurgeDevTestDataResult> => {
  logger.info({ target }, 'purgeDevTestData');

  const parentFolderId = getDevTestDataParentFolderId();
  const rootFolderId = await findDriveFolderByName(parentFolderId, target.folderName);
  if (rootFolderId) {
    await trashDriveFile(rootFolderId);
  }

  const clients = await readClients();
  const retainedClients = clients.filter(
    (client) => !client.clientCode.startsWith(target.clientCodePrefix),
  );
  const removedCount = clients.length - retainedClients.length;

  if (removedCount > 0) {
    await replaceClients(retainedClients);
  }

  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (clientConfigFileId) clientsCache.delete(clientConfigFileId);

  return {
    driveFolder: {
      name: target.folderName,
      action: rootFolderId ? 'trashed' : 'not_found',
    },
    clients: {
      clientCodePrefix: target.clientCodePrefix,
      action: removedCount > 0 ? 'removed' : 'unchanged',
      removedCount,
    },
  };
};

export default purgeDevTestData;
export type { PurgeDevTestDataResult };
