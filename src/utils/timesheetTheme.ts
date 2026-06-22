// Central theme file for timesheet styling.
// All colors used by applyTimesheetFormatting live here so they can be changed in one place.
//
// Google Sheets API expects RGB values on a 0–1 scale, not 0–255.
// The hex comments are the human-readable equivalents for reference.

type Color = { red: number; green: number; blue: number };

// ─── Colors ───────────────────────────────────────────────────────────────────

// #0E1733 — structural rows: day/date headers, activity label column, dividers, daily total rows.
const PRIMARY: Color = { red: 0.055, green: 0.09, blue: 0.2 };

// #6565AB — pay period and employee name header rows.
const SECONDARY: Color = { red: 0.396, green: 0.396, blue: 0.667 };

// #7A305C — holiday name cells in the holiday header row.
const ACCENT: Color = {
  red: 122 / 255, // 0.478
  green: 48 / 255, // 0.188
  blue: 92 / 255, // 0.361
};

// #D9C7D3 — muted accent variant, reserved for future use.
const MUTED_ACCENT: Color = { red: 0.851, green: 0.78, blue: 0.827 };

// #DCDEF0 — weekend and holiday data cells, and summary value cells.
const MUTED: Color = { red: 0.863, green: 0.871, blue: 0.941 };

// #CCCCF0 — darker muted variant (reserved for future use).
const MUTED_DARK: Color = { red: 0.8, green: 0.8, blue: 0.9 };

// Universal white and black — used for text colors and borders.
const WHITE: Color = { red: 1, green: 1, blue: 1 };
const BLACK: Color = { red: 0, green: 0, blue: 0 };

// ─── Column widths ────────────────────────────────────────────────────────────

// Width in pixels for the label column (A).
const LABEL_COLUMN_WIDTH = 165;

// Width in pixels for column B (the pay period date value cell) — wider so the date isn't cut off.
const HEADER_VALUE_COLUMN_WIDTH = 105;

// Width in pixels for each day column and the weekly total column.
const DAY_COLUMN_WIDTH = 100;

// ─── Exports ──────────────────────────────────────────────────────────────────

export type { Color };
export {
  PRIMARY,
  SECONDARY,
  ACCENT,
  MUTED_ACCENT,
  MUTED,
  MUTED_DARK,
  WHITE,
  BLACK,
  LABEL_COLUMN_WIDTH,
  HEADER_VALUE_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
};
