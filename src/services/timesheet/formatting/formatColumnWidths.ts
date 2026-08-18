import {
  LABEL_COLUMN_WIDTH,
  HEADER_VALUE_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
  UNIT_LABEL_COLUMN_WIDTH,
} from "#utils/timesheetTheme.js";

// Builds updateDimensionProperties requests for column A (label), column B (header value), all day
// columns plus the weekly total column, and the trailing "hours"/"shifts" unit-label column (the last
// column, totalColumnCount - 1) each activity row ends with — see buildActivityRow.
const formatColumnWidths = (sheetId: number, totalColumnCount: number): object[] => [
  {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
      properties: { pixelSize: LABEL_COLUMN_WIDTH },
      fields: "pixelSize",
    },
  },
  {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
      properties: { pixelSize: HEADER_VALUE_COLUMN_WIDTH },
      fields: "pixelSize",
    },
  },
  {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: totalColumnCount - 1 },
      properties: { pixelSize: DAY_COLUMN_WIDTH },
      fields: "pixelSize",
    },
  },
  {
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: totalColumnCount - 1, endIndex: totalColumnCount },
      properties: { pixelSize: UNIT_LABEL_COLUMN_WIDTH },
      fields: "pixelSize",
    },
  },
];

export default formatColumnWidths;
