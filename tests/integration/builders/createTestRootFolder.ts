import createFolder from '#db/adapter/createFolder.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';

const TEST_DATA_ROOT_FOLDER_ID = process.env.TEST_DATA_ROOT_FOLDER_ID;

interface TestRootFolder {
  folderId: string;
  folderLink: string;
}

const isSafeFolderNameCharacter = (character: string): boolean => {
  const code = character.charCodeAt(0);

  const isNumber = code >= 48 && code <= 57;
  const isUppercaseLetter = code >= 65 && code <= 90;
  const isLowercaseLetter = code >= 97 && code <= 122;

  return (
    isNumber || isUppercaseLetter || isLowercaseLetter || character === '_' || character === '-'
  );
};

const sanitizeLabel = (label: string): string => {
  const characters = Array.from(label);

  return characters
    .map((character) => (isSafeFolderNameCharacter(character) ? character : '-'))
    .join('');
};

const createTestRootFolder = async (label: string): Promise<TestRootFolder> => {
  if (!TEST_DATA_ROOT_FOLDER_ID) {
    throw new Error('TEST_DATA_ROOT_FOLDER_ID is not set — required for all test data builders');
  }

  const uniqueSuffix = Date.now().toString(36);
  const folderName = `${sanitizeLabel(label)}-${uniqueSuffix}`;
  const folderId = await createFolder(folderName, TEST_DATA_ROOT_FOLDER_ID);

  return {
    folderId,
    folderLink: buildDriveFolderLink(folderId),
  };
};

export default createTestRootFolder;
