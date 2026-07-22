import getDriveClient from './getDriveClient.js';
import driveLimiter from '#utils/rateLimiters/driveLimiter.js';
import scheduleGoogleApiCall from '#utils/rateLimiters/scheduleGoogleApiCall.js';
import { logger } from '#utils/logger.js';

// Returns a Drive file's modifiedTime (ISO string), or null if the file has no id or Drive has no record of it.
const getFileModifiedTime = async (fileId: string): Promise<string | null> => {
  if (!fileId) return null;

  logger.debug(`getFileModifiedTime fileId=${fileId}`);
  const drive = await getDriveClient();

  const response = await scheduleGoogleApiCall(driveLimiter, () => drive.files.get({
    fileId,
    fields: 'modifiedTime',
  }));

  return response.data.modifiedTime ?? null;
};

export default getFileModifiedTime;
