import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';
import { PermissionDeniedError } from '#utils/errors.js';

// Returns true if the given file ID resolves to a real, non-trashed Google Sheets workbook accessible
// via the OAuth client. A 404 is treated as "doesn't exist"; 403 becomes a domain permission error;
// other Drive errors propagate.
const workbookExists = async (fileId: string): Promise<boolean> => {
  const drive = getOAuthDriveClient();

  try {
    const response = await oauthDriveLimiter.schedule(() => drive.files.get({
      fileId,
      fields: 'id, trashed, mimeType',
    }));

    if (response.data.trashed) return false;
    if (response.data.mimeType !== 'application/vnd.google-apps.spreadsheet') return false;
    return true;
  } catch (error: any) {
    if (error?.code === 403) throw new PermissionDeniedError(`No access to Drive workbook: ${fileId}`);
    if (error?.code === 404) return false;
    throw error;
  }
};

export default workbookExists;
