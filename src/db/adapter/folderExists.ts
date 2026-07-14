import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';

// Returns true if the given folder ID resolves to a real, non-trashed folder accessible via the OAuth
// client — used to verify a user-supplied "existing folder" link before trusting it. A 404 (not found)
// is treated as "doesn't exist"; any other error (permission denied, quota, network) propagates rather
// than being silently treated as "doesn't exist" (permission-specific handling is deferred, see docs/TODO.md).
const folderExists = async (folderId: string): Promise<boolean> => {
  const drive = getOAuthDriveClient();

  try {
    const response = await oauthDriveLimiter.schedule(() => drive.files.get({
      fileId: folderId,
      fields: 'id, trashed, mimeType',
    }));

    if (response.data.trashed) return false;
    if (response.data.mimeType !== 'application/vnd.google-apps.folder') return false;
    return true;
  } catch (error: any) {
    if (error?.code === 404) return false;
    throw error;
  }
};

export default folderExists;
