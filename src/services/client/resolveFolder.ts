import parseDriveLink from '#utils/parseDriveLink.js';
import folderExists from '#db/adapter/folderExists.js';
import driveChildExists from '#db/adapter/driveChildExists.js';
import createFolder from '#db/adapter/createFolder.js';
import { NotFoundError, UnprocessableError } from '#utils/errors.js';

interface FolderInput {
  link?: string;
  createNew?: boolean;
}

// Resolves a folder input to a real, verified folder ID — either an existing folder (verified via
// folderExists) or a newly-created one (checked for a name collision first, so we never silently
// duplicate something a human already placed there).
const resolveFolder = async (
  input: FolderInput,
  parentFolderId: string,
  folderName: string,
): Promise<string> => {
  if (input.link) {
    const folderId = parseDriveLink(input.link);
    const exists = await folderExists(folderId);
    if (!exists) throw new NotFoundError(`Folder not found or inaccessible: ${input.link}`);
    return folderId;
  }

  if (input.createNew) {
    const parentExists = await folderExists(parentFolderId);
    if (!parentExists) {
      throw new NotFoundError(`Parent folder not found or inaccessible: ${parentFolderId}`);
    }

    const collision = await driveChildExists(parentFolderId, folderName);
    if (collision) {
      throw new UnprocessableError(`A folder named "${folderName}" already exists in the parent folder`);
    }

    return createFolder(folderName, parentFolderId);
  }

  throw new UnprocessableError('Folder input must specify either "link" or "createNew"');
};

export default resolveFolder;
export type { FolderInput };
