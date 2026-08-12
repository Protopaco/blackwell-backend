import { type Color } from "#utils/timesheetTheme.js";
import apiRange from "./apiRange.js";

// Builds an updateBorders request that draws a solid-medium outline around a multi-row block's full
// bounding range — used for the block-level borders around the Summary/Week/Approval/Totals blocks, as
// opposed to outlineBorder's single-row solid-thin outline used for rows within a block.
// startRowNumber/endRowNumberInclusive are 1-based.
const outlineBlockBorder = (
  sheetId: number,
  startRowNumber: number,
  endRowNumberInclusive: number,
  startColumnIndex: number,
  endColumnIndex: number,
  color: Color,
): object => {
  const mediumBorder = { style: "SOLID_MEDIUM", width: 2, color };
  return {
    updateBorders: {
      range: apiRange(sheetId, startRowNumber - 1, endRowNumberInclusive, startColumnIndex, endColumnIndex),
      top: mediumBorder,
      bottom: mediumBorder,
      left: mediumBorder,
      right: mediumBorder,
    },
  };
};

export default outlineBlockBorder;
