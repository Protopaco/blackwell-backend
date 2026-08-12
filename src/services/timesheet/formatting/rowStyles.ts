import {
  ACCENT,
  type Color,
  HEADER_TEXT,
  MUTED,
  PRIMARY_DARK,
  SECONDARY,
  WHITE,
} from "#utils/timesheetTheme.js";

// Sides to draw when a RowStyle's border is applied — same shape as outlineBorder's boolean flags.
interface BorderSides {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  innerHorizontal?: boolean;
  innerVertical?: boolean;
}

// The full set of cell-format properties fillRange always writes together (background, text format,
// alignment) — grouping them here is what lets applyRowStyle compute a correct, complete fields mask
// without each row type having to type it out by hand.
interface CellFill {
  backgroundColor: Color;
  textColor: Color;
  bold: boolean;
  horizontalAlignment: "LEFT" | "CENTER" | "RIGHT";
}

// Declarative style for one named row type in the timesheet: the base fill applied across the whole
// row, an optional different fill for just the label cell (column A), an optional border outlining the
// row, and an optional fill override applied to holiday columns. Consumed by applyRowStyle to build the
// actual repeatCell/updateBorders requests — a new row type only needs a new entry here.
interface RowStyle {
  fill: CellFill;
  labelFill?: CellFill;
  border?: { color: Color; sides: BorderSides };
  holidayFill?: CellFill;
}

// identityRow — the Summary block's 4-row employee/position/pay-period header.
const identityRow: RowStyle = {
  fill: { backgroundColor: SECONDARY, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "LEFT" },
  border: {
    color: MUTED,
    sides: { top: true, bottom: true, left: true, right: true, innerHorizontal: true, innerVertical: true },
  },
};

// weekLabelRow — the Week block's holiday-name row; the whole row is SECONDARY unless a holiday
// column overrides it, and the label cell also carries the week's date range.
const weekLabelRow: RowStyle = {
  fill: { backgroundColor: SECONDARY, textColor: HEADER_TEXT, bold: false, horizontalAlignment: "CENTER" },
  labelFill: { backgroundColor: SECONDARY, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "LEFT" },
  border: { color: MUTED, sides: { right: true, innerVertical: true } },
  holidayFill: { backgroundColor: ACCENT, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "CENTER" },
};

// dayOfWeekRow — Mon/Tue/.../Sun. dateRow and sectionLabelRow share this exact styling.
const dayOfWeekRow: RowStyle = {
  fill: { backgroundColor: PRIMARY_DARK, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "CENTER" },
  border: { color: MUTED, sides: { innerVertical: true } },
  holidayFill: { backgroundColor: ACCENT, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "CENTER" },
};

// dateRow — day-number header (6/1, 6/2, ...); identical styling to dayOfWeekRow.
const dateRow: RowStyle = dayOfWeekRow;

// sectionLabelRow — "Hourly"/"Flat Rate" section header; identical styling to dayOfWeekRow.
const sectionLabelRow: RowStyle = dayOfWeekRow;

// dailyTotalRow — the per-section sum-formula row; label cell is left-aligned instead of centered.
const dailyTotalRow: RowStyle = {
  fill: { backgroundColor: PRIMARY_DARK, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "CENTER" },
  labelFill: { backgroundColor: PRIMARY_DARK, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "LEFT" },
  border: { color: MUTED, sides: { bottom: true, left: true, right: true, innerVertical: true } },
  holidayFill: { backgroundColor: ACCENT, textColor: HEADER_TEXT, bold: true, horizontalAlignment: "CENTER" },
};

// spacerRow — the blank visual gap between the Hourly and Flat Rate sections.
const spacerRow: RowStyle = {
  fill: { backgroundColor: WHITE, textColor: HEADER_TEXT, bold: false, horizontalAlignment: "LEFT" },
  holidayFill: { backgroundColor: ACCENT, textColor: HEADER_TEXT, bold: false, horizontalAlignment: "CENTER" },
};

export type { RowStyle, CellFill, BorderSides };
export {
  identityRow,
  weekLabelRow,
  dayOfWeekRow,
  dateRow,
  sectionLabelRow,
  dailyTotalRow,
  spacerRow,
};
