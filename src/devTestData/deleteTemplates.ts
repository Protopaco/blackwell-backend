import findDriveFolderByName from '#db/adapter/findDriveFolderByName.js';
import trashDriveFile from '#db/adapter/trashDriveFile.js';
import {
  DEV_TEST_DATA_CLIENT_CODE_PREFIX,
  DEV_TEST_DATA_TEMPLATE_ROOT_FOLDER_NAME,
} from './constants.js';
import removeDevTestClientRows from './removeDevTestClientRows.js';

const deleteTemplates = async (templateParentFolderId: string): Promise<number> => {
  const existingTemplateRootFolderId = await findDriveFolderByName(
    templateParentFolderId,
    DEV_TEST_DATA_TEMPLATE_ROOT_FOLDER_NAME,
  );
  if (existingTemplateRootFolderId) {
    await trashDriveFile(existingTemplateRootFolderId);
  }

  const removedClients = await removeDevTestClientRows(
    (clientCode) => clientCode.startsWith(DEV_TEST_DATA_CLIENT_CODE_PREFIX),
  );
  return removedClients.removedCount;
};

export default deleteTemplates;
