import getDriveClient from './getDriveClient.js';
import driveLimiter from '#utils/rateLimiters/driveLimiter.js';
import { logger } from '#utils/logger.js';

// Creates a new Google Sheets workbook owned by the service account — not currently used for
// employee files (see createOAuthWorkbook), but available for admin-created files.
const createWorkbook = async (name: string, folderId?: string): Promise<string> => {
  logger.debug(`Creating workbook: ${name}`);
  const drive = await getDriveClient();

  const fileMetadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.spreadsheet',
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const response = await driveLimiter.schedule(() => drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  }));

  const workbookId = response.data.id;
  if (!workbookId) throw new Error(`Failed to create workbook: ${name}`);

  logger.debug(`Workbook created: ${workbookId}`);
  return workbookId;
};

export default createWorkbook;
