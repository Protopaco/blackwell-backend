import apiRange from "./apiRange.js";

// Builds a setDataValidation request restricting a ClockInOut slot row's activity cell to a dropdown of
// the employee's assigned hourly activities. columnIndex is 0-based.
const setActivityDataValidation = (
  sheetId: number,
  rowNumber: number,
  columnIndex: number,
  activityNames: string[],
): object => ({
  setDataValidation: {
    range: apiRange(sheetId, rowNumber - 1, rowNumber, columnIndex, columnIndex + 1),
    rule: {
      condition: {
        type: "ONE_OF_LIST",
        values: activityNames.map((activityName) => ({ userEnteredValue: activityName })),
      },
      strict: true,
      showCustomUi: true,
    },
  },
});

export default setActivityDataValidation;
