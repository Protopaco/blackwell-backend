import { google } from 'googleapis';
import getAuthClient from './getAuthClient.js';

// Returns an authenticated Google Sheets API client — used for all spreadsheet read/write operations.
const getSheetsClient = async () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};

export default getSheetsClient;
