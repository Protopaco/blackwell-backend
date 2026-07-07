import apiRange from "./apiRange.js";
import { colLetter } from "../rowBuilders.js";

// Builds a setDataValidation request that restricts a row's day columns to non-negative numbers
// with at most 2 decimal places (supports .25 increments). Hard rejects invalid input.
const setHourDataValidation = (
  sheetId: number,
  rowNumber: number,
  firstDayColumnIndex: number,
  lastDayColumnIndex: number,
): object => {
  const firstDayCellReference = `${colLetter(firstDayColumnIndex)}${rowNumber}`;
  return {
    setDataValidation: {
      range: apiRange(sheetId, rowNumber - 1, rowNumber, firstDayColumnIndex, lastDayColumnIndex + 1),
      rule: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [{ userEnteredValue: `=AND(ISNUMBER(${firstDayCellReference}),${firstDayCellReference}>=0,${firstDayCellReference}=ROUND(${firstDayCellReference},2))` }],
        },
        strict: true,
        showCustomUi: false,
      },
    },
  };
};

export default setHourDataValidation;
