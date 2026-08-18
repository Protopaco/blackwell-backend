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

// #FCA5A5 — red for holiday name cells and holiday-column header rows.
const ACCENT: Color = { red: 0.988, green: 0.647, blue: 0.647 };

// #FEE2E2 — light red for holiday columns on even-indexed activity rows.
const MUTED_ACCENT: Color = { red: 0.996, green: 0.886, blue: 0.886 };

// #FECACA — mid-light red for holiday columns on odd-indexed activity rows.
const MUTED_ACCENT_DARK: Color = { red: 0.996, green: 0.792, blue: 0.792 };

// #D9F2E3 — light green for a FlatRate activity row's label cell.
const FLAT_RATE: Color = { red: 0.851, green: 0.949, blue: 0.890 };

// #FDECC8 — light amber for a time-off (ETO/PTO/STO) activity row's label cell.
const TIME_OFF: Color = { red: 0.992, green: 0.925, blue: 0.784 };

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

// Width in pixels for a TotalHours activity row's trailing "hours"/"shifts" unit-label column — narrower
// than DAY_COLUMN_WIDTH since it only ever holds one short word.
const UNIT_LABEL_COLUMN_WIDTH = 70;

// Height in pixels for headerSpacerRow, the half-height gap between a week's dateRow and its activity
// block — about half Google Sheets' default row height (~21px), for a cleaner, thinner break.
const SPACER_ROW_HEIGHT = 10;

// Width in pixels for a ClockInOut week's activity dropdown column — wider than DAY_COLUMN_WIDTH so
// long activity names aren't cut off in the dropdown cell.
const CLOCK_IN_OUT_ACTIVITY_COLUMN_WIDTH = 250;

// ─── Exports ──────────────────────────────────────────────────────────────────

export type { Color };
export {
  PRIMARY,
  PRIMARY_DARK,
  SECONDARY,
  ACCENT,
  MUTED_ACCENT,
  MUTED_ACCENT_DARK,
  FLAT_RATE,
  TIME_OFF,
  MUTED,
  MUTED_DARK,
  TEXT,
  HEADER_TEXT,
  WHITE,
  BLACK,
  LABEL_COLUMN_WIDTH,
  HEADER_VALUE_COLUMN_WIDTH,
  DAY_COLUMN_WIDTH,
  UNIT_LABEL_COLUMN_WIDTH,
  SPACER_ROW_HEIGHT,
  CLOCK_IN_OUT_ACTIVITY_COLUMN_WIDTH,
};
