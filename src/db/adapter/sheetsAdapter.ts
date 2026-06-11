import { google } from 'googleapis';
import { logger } from '#utils/logger.js';

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

const getSheetsClient = async () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};

const getDriveClient = async () => {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
};

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

const tabExists = async (workbookId: string, tabName: string): Promise<boolean> => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
    return spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === tabName) ?? false;
  } catch {
    return false;
  }
};

const createTabIfNotExists = async (workbookId: string, tabName: string): Promise<void> => {
  try {
    await createTab(workbookId, tabName);
  } catch (error: any) {
    const alreadyExists = error?.errors?.[0]?.reason === 'badRequest' &&
      error?.message?.includes('already exists');
    if (!alreadyExists) throw error;
    logger.debug(`Tab already exists, skipping create: ${tabName}`);
  }
};

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

const deleteTab = async (workbookId: string, tabName: string): Promise<void> => {
  logger.debug(`Deleting tab: ${tabName} from workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab?.properties?.sheetId) {
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

const deleteRow = async (workbookId: string, tabName: string, rowNumber: number): Promise<void> => {
  logger.debug(`Deleting row: ${rowNumber} from tab: ${tabName} in workbook: ${workbookId}`);
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: workbookId });
  const tab = spreadsheet.data.sheets?.find((s) => s.properties?.title === tabName);

  if (!tab?.properties?.sheetId) {
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

export default {
  createWorkbook,
  updateCells,
  createTab,
  tabExists,
  createTabIfNotExists,
  readTab,
  readTabValues,
  writeTab,
  writeValues,
  appendRow,
  deleteTab,
  deleteRow,
};
