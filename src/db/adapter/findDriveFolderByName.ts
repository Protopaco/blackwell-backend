import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';

const findDriveFolderByName = async (
  parentFolderId: string,
  folderName: string,
): Promise<string | undefined> => {
  const drive = getOAuthDriveClient();
  const escapedFolderName = folderName.split("'").join("\\'");

  const response = await oauthDriveLimiter.schedule(() =>
    drive.files.list({
      q: `'${parentFolderId}' in parents and name = '${escapedFolderName}' and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
      fields: 'files(id)',
      pageSize: 1,
    }),
  );

  return response.data.files?.[0]?.id ?? undefined;
};

export default findDriveFolderByName;
