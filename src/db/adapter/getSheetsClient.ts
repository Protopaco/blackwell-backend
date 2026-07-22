import { google } from 'googleapis';
import getAuthClient from './getAuthClient.js';

// Returns an authenticated Google Sheets API client — used for all spreadsheet read/write operations.
// retry: false — retries on 429 are handled by scheduleGoogleApiCall instead, so each retry attempt
// goes through the rate limiter and is accounted for, rather than firing silently inside gaxios.
const getSheetsClient = async () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth, retry: false });
};

export default getSheetsClient;
