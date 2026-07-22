import getOAuthDriveClient from './getOAuthDriveClient.js';
import oauthDriveLimiter from '#utils/rateLimiters/oauthDriveLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Creates a new Google Sheets workbook owned by the OAuth user in the specified Drive folder.
// Used when generating a timesheet file for an employee who doesn't have one yet.
const createOAuthWorkbook = async (name: string, folderId: string): Promise<string> => {
  logger.debug(`Creating workbook via OAuth: ${name}`);
  const drive = getOAuthDriveClient();

  const response = await scheduleGoogleApiCall(oauthDriveLimiter, () => drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId],
    },
    fields: 'id',
  }));

  const workbookId = response.data.id;
  if (!workbookId) throw new Error(`Failed to create workbook via OAuth: ${name}`);

  logger.debug(`Workbook created via OAuth: ${workbookId}`);
  return workbookId;
};

export default createOAuthWorkbook;
