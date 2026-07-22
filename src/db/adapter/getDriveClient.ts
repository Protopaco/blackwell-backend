import { google } from 'googleapis';
import getAuthClient from './getAuthClient.js';

// Returns an authenticated Google Drive API client (service account) — used for creating workbooks.
// retry: false — retries on 429 are handled by scheduleGoogleApiCall instead, so each retry attempt
// goes through the rate limiter and is accounted for, rather than firing silently inside gaxios.
const getDriveClient = async () => {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth, retry: false });
};

export default getDriveClient;
