import { type Color } from "#utils/timesheetTheme.js";
import apiRange from "./apiRange.js";

// Builds an updateBorders request that draws a solid outline around a multi-row block's full bounding
// range — used for the block-level borders around the Summary/Week/Approval/Totals/ClockInOut-day
// blocks, as opposed to outlineBorder's single-row solid-thin outline used for rows within a block.
// startRowNumber/endRowNumberInclusive are 1-based. thick=true draws a heavier SOLID_THICK border
// (e.g. the ClockInOut per-day box) instead of the default SOLID_MEDIUM.
const outlineBlockBorder = (
  sheetId: number,
  startRowNumber: number,
  endRowNumberInclusive: number,
  startColumnIndex: number,
  endColumnIndex: number,
  color: Color,
  thick = false,
): object => {
  const border = thick
    ? { style: "SOLID_THICK", width: 3, color }
    : { style: "SOLID_MEDIUM", width: 2, color };
  return {
    updateBorders: {
      range: apiRange(sheetId, startRowNumber - 1, endRowNumberInclusive, startColumnIndex, endColumnIndex),
      top: border,
      bottom: border,
      left: border,
      right: border,
    },
  };
};

export default outlineBlockBorder;
