import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Creates a new Drive folder owned by the OAuth user (the client's own Drive) inside the given parent folder.
const createFolder = async (name: string, parentFolderId: string): Promise<string> => {
  logger.debug(`Creating folder via OAuth: ${name} in parent: ${parentFolderId}`);
  const drive = getOAuthDriveClient();

  const response = await scheduleGoogleApiCall(oauthDriveLimiter, () => drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  }));

  const folderId = response.data.id;
  if (!folderId) throw new Error(`Failed to create folder via OAuth: ${name}`);

  logger.debug(`Folder created via OAuth: ${folderId}`);
  return folderId;
};

export default createFolder;
