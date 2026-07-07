import { google } from 'googleapis';
import getAuthClient from './getAuthClient.js';

// Returns an authenticated Google Drive API client (service account) — used for creating workbooks.
const getDriveClient = async () => {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
};

export default getDriveClient;
