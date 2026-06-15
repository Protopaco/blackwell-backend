// Central theme file for timesheet styling.
// All colors used by applyTimesheetFormatting live here so they can be changed in one place.
//
// Google Sheets API expects RGB values on a 0–1 scale, not 0–255.
// The hex comments are the human-readable equivalents for reference.

type Color = { red: number; green: number; blue: number };

// ─── Colours ─────────────────────────────────────────────────────────────────

// #0D0D3B — used for day/date row headers, activity label column, dividers, and daily total rows.
const DARK_NAVY: Color = { red: 0.051, green: 0.051, blue: 0.231 };

// #6565AB — used for the pay period and employee name header rows.
const HEADER_PURPLE: Color = { red: 0.396, green: 0.396, blue: 0.667 };

// #661F66 — used for holiday name cells in the holiday header row.
const HOLIDAY_DARK: Color = { red: 0.400, green: 0.122, blue: 0.400 };

// #DCDEF0 — used for weekend and holiday data cells, and summary value cells.
const LIGHT_LAVENDER: Color = { red: 0.863, green: 0.871, blue: 0.941 };

// Standard white and black — used for text colors and borders.
const WHITE: Color = { red: 1, green: 1, blue: 1 };
const BLACK: Color = { red: 0, green: 0, blue: 0 };

// ─── Column widths ────────────────────────────────────────────────────────────

// Width in pixels for the label column (A).
const LABEL_COLUMN_WIDTH = 165;

// Width in pixels for each day column and the weekly total column.
const DAY_COLUMN_WIDTH = 65;

// ─── Exports ──────────────────────────────────────────────────────────────────

export type { Color };
export {
  DARK_NAVY,
  HEADER_PURPLE,
  HOLIDAY_DARK,
  LIGHT_LAVENDER,
  WHITE,
  BLACK,
  LABEL_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
};
