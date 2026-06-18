import { BLACK, PRIMARY } from "#utils/timesheetTheme.js";
import apiRange from "./apiRange.js";

// Builds an updateBorders request that draws a solid outline around a single row range. rowNumber is 1-based.
const outlineBorder = (
  sheetId: number,
  rowNumber: number,
  startColumnIndex: number,
  endColumnIndex: number,
  color = PRIMARY,
): object => {
  const solidBorder = { style: "SOLID", width: 1, color };
  return {
    updateBorders: {
      range: apiRange(
        sheetId,
        rowNumber - 1,
        rowNumber,
        startColumnIndex,
        endColumnIndex,
      ),
      top: solidBorder,
      bottom: solidBorder,
      left: solidBorder,
      right: solidBorder,
      innerHorizontal: solidBorder,
      innerVertical: solidBorder,
    },
  };
};

export default outlineBorder;
