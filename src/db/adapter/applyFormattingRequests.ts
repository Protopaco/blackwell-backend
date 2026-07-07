import getSheetsClient from './getSheetsClient.js';

// Sends an array of pre-built formatting requests in a single batchUpdate call — used by applyTimesheetFormatting.
const applyFormattingRequests = async (workbookId: string, requests: object[]): Promise<void> => {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: workbookId,
    requestBody: { requests },
  });
};

export default applyFormattingRequests;
