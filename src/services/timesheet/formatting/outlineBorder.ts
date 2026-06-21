import { BLACK, PRIMARY } from "#utils/timesheetTheme.js";
import apiRange from "./apiRange.js";

// Builds an updateBorders request that draws a solid outline around a single row range. rowNumber is 1-based.
const outlineBorder = (
  sheetId: number,
  rowNumber: number,
  startColumnIndex: number,
  endColumnIndex: number,
  color = PRIMARY,
  top = true,
  bottom = true,
  left = true,
  right = true,
  innerHorizontal = false,
  innerVertical = false,
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
      top: top ? solidBorder : undefined,
      bottom: bottom ? solidBorder : undefined,
      left: left ? solidBorder : undefined,
      right: right ? solidBorder : undefined,
      innerHorizontal: innerHorizontal ? solidBorder : undefined,
      innerVertical: innerVertical ? solidBorder : undefined,
    },
  };
};

export default outlineBorder;
