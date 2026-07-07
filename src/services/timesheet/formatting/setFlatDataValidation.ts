import apiRange from "./apiRange.js";
import { colLetter } from "../rowBuilders.js";

// Builds a setDataValidation request that restricts a flat rate row's day columns to non-negative
// whole numbers only. Hard rejects decimals, text, and negative values.
const setFlatDataValidation = (
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
          values: [{ userEnteredValue: `=AND(ISNUMBER(${firstDayCellReference}),${firstDayCellReference}>=0,${firstDayCellReference}=INT(${firstDayCellReference}))` }],
        },
        strict: true,
        showCustomUi: false,
      },
    },
  };
};

export default setFlatDataValidation;
