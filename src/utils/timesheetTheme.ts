// Central theme file for timesheet styling.
// All colors used by applyTimesheetFormatting live here so they can be changed in one place.
//
// Google Sheets API expects RGB values on a 0–1 scale, not 0–255.
// The hex comments are the human-readable equivalents for reference.

type Color = { red: number; green: number; blue: number };

// ─── Colors ───────────────────────────────────────────────────────────────────

// #D9EAF7 — light blue for day/date headers, activity labels, and daily total rows.
const PRIMARY: Color = { red: 0.851, green: 0.918, blue: 0.969 };

// #A4C2F4 — stronger blue for dividers and prominent section headers.
const PRIMARY_DARK: Color = { red: 0.643, green: 0.761, blue: 0.957 };

// #E4DDF2 — light lavender for pay period and employee name header rows.
const SECONDARY: Color = { red: 0.894, green: 0.867, blue: 0.949 };

// #FFF2CC — pale yellow for holiday name cells.
const ACCENT: Color = { red: 1, green: 0.949, blue: 0.8 };

// #FCE5CD — pale peach for holiday columns and special-rate cells.
const MUTED_ACCENT: Color = { red: 0.988, green: 0.898, blue: 0.804 };

// #F4CCCC — pale red for stronger exceptions or special-rate indicators.
const MUTED_ACCENT_DARK: Color = { red: 0.957, green: 0.8, blue: 0.8 };

// #F1F3F4 — very light gray for weekend cells and summary values.
const MUTED: Color = { red: 0.945, green: 0.953, blue: 0.957 };

// #D9D9D9 — medium-light gray for borders, inactive cells, or alternating rows.
const MUTED_DARK: Color = { red: 0.851, green: 0.851, blue: 0.851 };

// #3C4043 — standard dark gray body text.
const TEXT: Color = { red: 0.235, green: 0.251, blue: 0.263 };

// #243447 — dark blue-gray header text.
const HEADER_TEXT: Color = { red: 0.141, green: 0.204, blue: 0.278 };

// Universal white and black — used for text colors and borders.
const WHITE: Color = { red: 1, green: 1, blue: 1 };
const BLACK: Color = { red: 0, green: 0, blue: 0 };

// ─── Column widths ────────────────────────────────────────────────────────────

// Width in pixels for the label column (A).
const LABEL_COLUMN_WIDTH = 210;

// Width in pixels for column B (the pay period date value cell) — wider so the date isn't cut off.
const HEADER_VALUE_COLUMN_WIDTH = 105;

// Width in pixels for each day column and the weekly total column.
const DAY_COLUMN_WIDTH = 100;

// ─── Exports ──────────────────────────────────────────────────────────────────

export type { Color };
export {
  PRIMARY,
  PRIMARY_DARK,
  SECONDARY,
  ACCENT,
  MUTED_ACCENT,
  MUTED_ACCENT_DARK,
  MUTED,
  MUTED_DARK,
  TEXT,
  HEADER_TEXT,
  WHITE,
  BLACK,
  LABEL_COLUMN_WIDTH,
  HEADER_VALUE_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
};
