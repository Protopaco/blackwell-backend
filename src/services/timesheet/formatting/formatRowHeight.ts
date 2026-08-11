// Builds an updateDimensionProperties request that sets a single row's height in pixels. rowNumber is
// 1-based. Used to shrink the spacerRow to half Google Sheets' default row height for a cleaner break.
const formatRowHeight = (sheetId: number, rowNumber: number, pixelSize: number): object => ({
  updateDimensionProperties: {
    range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
    properties: { pixelSize },
    fields: "pixelSize",
  },
});

export default formatRowHeight;
