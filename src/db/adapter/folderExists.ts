import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { PermissionDeniedError } from '#utils/errors.js';

// Returns true if the given folder ID resolves to a real, non-trashed folder accessible via the OAuth
// client — used to verify a user-supplied "existing folder" link before trusting it. A 404 (not found)
// is treated as "doesn't exist"; 403 becomes a domain permission error; any other error (quota,
// network) propagates rather than being silently treated as "doesn't exist".
const folderExists = async (folderId: string): Promise<boolean> => {
  const drive = getOAuthDriveClient();

  try {
    const response = await scheduleGoogleApiCall(oauthDriveLimiter, () => drive.files.get({
      fileId: folderId,
      fields: 'id, trashed, mimeType',
    }));

    if (response.data.trashed) return false;
    if (response.data.mimeType !== 'application/vnd.google-apps.folder') return false;
    return true;
  } catch (error: any) {
    if (error?.code === 403) throw new PermissionDeniedError(`No access to Drive folder: ${folderId}`);
    if (error?.code === 404) return false;
    throw error;
  }
};

export default folderExists;
