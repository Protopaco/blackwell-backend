import { google } from 'googleapis';
import { logger } from '#utils/logger.js';

// Builds a GoogleAuth client from the service account JSON env var — used by all service-account API calls.
const getAuthClient = () => {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
};

// Returns an authenticated Google Sheets API client — used for all spreadsheet read/write operations.
const getSheetsClient = async () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};

// Returns an authenticated Google Drive API client (service account) — used for creating workbooks.
const getDriveClient = async () => {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
};

// Returns a Google Drive API client authenticated as a real user via OAuth — required so new files
// are owned by the user rather than the service account, making them visible in their Google Drive.
const getOAuthDriveClient = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN must be set');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
};

// Creates a new Google Sheets workbook owned by the OAuth user in the specified Drive folder.
// Used when generating a timesheet file for an employee who doesn't have one yet.
const createOAuthWorkbook = async (name: string, folderId: string): Promise<string> => {
  logger.debug(`Creating workbook via OAuth: ${name}`);
  const drive = getOAuthDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId],
    },
    fields: 'id',
  });

  const workbookId = response.data.id;
  if (!workbookId) throw new Error(`Failed to create workbook via OAuth: ${name}`);

  logger.debug(`Workbook created via OAuth: ${workbookId}`);
  return workbookId;
};

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

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  const workbookId = response.data.id;
  if (!workbookId) throw new Error(`Failed to create workbook: ${name}`);

  logger.debug(`Workbook created: ${workbookId}`);
  return workbookId;
};

// Adds a new sheet tab to an existing workbook — throws if the tab already exists.
const createTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Creating tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: tabName },
          },
        },
      ],
    },
  });
};

// Returns true if a tab with the given name exists in the workbook — used before creating or deleting tabs.
const tabExists = async (workbookId: string, tabName: string): Promise<boolean> => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
    return spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tabName) ?? false;
  } catch {
    return false;
  }
};

// Creates a tab only if it doesn't already exist — safe to call unconditionally when writing timesheet or manifest tabs.
// Also removes the default Sheet1 that Google adds to every new workbook, if it still exists after the new tab is created.
const createTabIfNotExists = async (workbookId: string, tabName: string): Promise<void> => {
  try {
    await createTab(workbookId, tabName);
  } catch (error: any) {
    const alreadyExists = error?.errors?.[0]?.reason === 'badRequest' &&
      error?.message?.includes('already exists');
    if (!alreadyExists) throw error;
    logger.debug(`Tab already exists, skipping create: ${tabName}`);
  }

  if (tabName !== 'Sheet1') {
    const defaultSheetExists = await tabExists(workbookId, 'Sheet1');
    if (defaultSheetExists) {
      logger.debug(`Removing default Sheet1 from workbook: ${workbookId}`);
      await deleteTab(workbookId, 'Sheet1');
    }
  }
};

// Reads a tab and maps each row to a keyed object using the first row as headers — used for config/data tabs.
const readTab = async (
  workbookId: string,
  tabName: string,
): Promise<Record<string, unknown>[]> => {
  logger.debug(`Reading tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: workbookId,
    range: tabName,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];
  if (rows.length === 1) return []; // headers only

  const headers = rows[0] as string[];

  return rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
};

// Overwrites an entire tab with keyed row objects, writing headers on the first row — used when updating pay period records.
const writeTab = async (
  workbookId: string,
  tabName: string,
  rows: Record<string, unknown>[],
): Promise<void> => {
  logger.debug(`Writing tab: ${tabName} in workbook: ${workbookId}`);
  if (rows.length === 0) return;

  const sheets = await getSheetsClient();
  const headers = Object.keys(rows[0]);
  const values = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))];

  await sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

// Writes a raw 2D array to a tab with USER_ENTERED input option (formulas are interpreted).
// Use this instead of writeTab when the data contains Sheets formulas.
// Writes values to a specific A1 range (e.g. "Employees!K3:L3"). USER_ENTERED so formulas work.
const updateCells = async (workbookId: string, range: string, values: unknown[][]): Promise<void> => {
  logger.debug(`Updating cells: ${range} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: values as string[][] },
  });
};

// Returns raw rows with no header interpretation — use when the first row is data, not a header.
const readTabValues = async (workbookId: string, tabName: string): Promise<unknown[][]> => {
  logger.debug(`Reading raw values from tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: workbookId,
    range: tabName,
  });
  return (response.data.values as unknown[][]) ?? [];
};

const writeValues = async (
  workbookId: string,
  tabName: string,
  values: unknown[][],
): Promise<void> => {
  logger.debug(`Writing values to tab: ${tabName} in workbook: ${workbookId}`);
  if (values.length === 0) return;

  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: values as string[][] },
  });
};

// Appends a single row of values to the end of a tab — used when adding new pay periods or manifest entries.
const appendRow = async (
  workbookId: string,
  tabName: string,
  row: Record<string, unknown>,
): Promise<void> => {
  logger.debug(`Appending row to tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const values = [Object.values(row)];

  await sheets.spreadsheets.values.append({
    spreadsheetId: workbookId,
    range: tabName,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};

// Permanently removes a tab from a workbook — used to delete the default Sheet1 after a new timesheet file is set up.
const deleteTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Deleting tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab || tab.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          deleteSheet: { sheetId: tab.properties.sheetId },
        },
      ],
    },
  });
};

// Deletes a single row (1-based) from a tab — used when removing a manifest entry after a timesheet tab is deleted.
const deleteRow = async (workbookId: string, tabName: string, rowNumber: number): Promise<void> => {
  logger.debug(`Deleting row: ${rowNumber} from tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab || tab.properties?.sheetId === undefined) {
    throw new Error(`Tab not found: ${tabName}`);
  }

  // Sheets API uses 0-based row index — convert from 1-based
  const startIndex = rowNumber - 1;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tab.properties.sheetId,
              dimension: 'ROWS',
              startIndex,
              endIndex: startIndex + 1,
            },
          },
        },
      ],
    },
  });
};

// Renames an existing tab — used to archive current_hours and current_adp_summary before a payroll report re-run.
const renameTab = async (workbookId: string, currentTabName: string, newTabName: string): Promise<void> => {
  logger.debug(`Renaming tab: ${currentTabName} → ${newTabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === currentTabName);

  if (!tab || tab.properties?.sheetId == null) throw new Error(`Tab not found: ${currentTabName}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: tab.properties.sheetId, title: newTabName },
            fields: 'title',
          },
        },
      ],
    },
  });
};

// Returns the numeric sheetId for a named tab — required by formatting batchUpdate requests.
const getSheetId = async (workbookId: string, tabName: string): Promise<number> => {
  const sheets = await getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);
  if (!sheet || sheet.properties?.sheetId == null) throw new Error(`Tab not found: ${tabName}`);
  return sheet.properties.sheetId;
};

// Sends an array of pre-built formatting requests in a single batchUpdate call — used by applyTimesheetFormatting.
const applyFormattingRequests = async (workbookId: string, requests: object[]): Promise<void> => {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: { requests },
  });
};

export default {
  createWorkbook,
  createOAuthWorkbook,
  updateCells,
  createTab,
  tabExists,
  createTabIfNotExists,
  renameTab,
  readTab,
  readTabValues,
  writeTab,
  writeValues,
  appendRow,
  deleteTab,
  deleteRow,
  getSheetId,
  applyFormattingRequests,
};
