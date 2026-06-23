import apiRange from "./apiRange.js";

// Builds a mergeCells request that merges all cells in the given range into one. rowNumber is 1-based.
const mergeCells = (
  sheetId: number,
  rowNumber: number,
  startColumnIndex: number,
  endColumnIndex: number,
): object => ({
  mergeCells: {
    range: apiRange(
      sheetId,
      rowNumber - 1,
      rowNumber,
      startColumnIndex,
      endColumnIndex,
    ),
    mergeType: "MERGE_ALL",
  },
});

export default mergeCells;
