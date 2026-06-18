// Builds a request to freeze the top 3 rows (pay period header, employee name, divider).
const formatFreezeRows = (sheetId: number): object => ({
  updateSheetProperties: {
    properties: { sheetId, gridProperties: { frozenRowCount: 3 } },
    fields: "gridProperties.frozenRowCount",
  },
});

export default formatFreezeRows;
