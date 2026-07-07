// Builds a Google Sheets API GridRange object. All indexes are 0-based; end indexes are exclusive.
const apiRange = (
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
) => ({
  sheetId,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
});

export default apiRange;
