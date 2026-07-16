import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';
import { logger } from '#utils/logger.js';

const trashDriveFile = async (fileId: string): Promise<void> => {
  logger.debug(`Trashing Drive file: ${fileId}`);
  const drive = getOAuthDriveClient();

  await oauthDriveLimiter.schedule(() => drive.files.update({
    fileId,
    requestBody: { trashed: true },
    fields: 'id, trashed',
  }));
};

export default trashDriveFile;
