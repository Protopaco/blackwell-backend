# Timesheet Style Guide

Defines the structure and visual styling of the generated per-employee timesheet Google Sheet
(`applyTimesheetFormatting.ts` and `src/services/timesheet/formatting/*`). This is a working draft —
sections marked **Proposed** describe the redesign discussed to fix unlabeled/ambiguous sections
(flat-rate rows blending into hourly rows, no week labels, no flat-rate Daily Total); everything else
describes what's actually implemented today.

**Two entirely different layouts exist**, chosen by `Settings.timeInputMethod`. Everything below the
"ClockInOut Timesheets" section describes the **TotalHours** layout (`buildWeek.ts` /
`applyTimesheetFormatting.ts`'s week-section path). See the dedicated "ClockInOut Timesheets" section
near the bottom of this doc for the ClockInOut layout (`buildClockInOutTimesheet.ts` /
`formatClockInOutTimesheet.ts`) — the two do not share row/column structure at all, only the color
palette and a few row-style building blocks.

## Status legend

- **Existing** — implemented today, unchanged by the redesign
- **Proposed** — not yet implemented; part of the redesign
- **Existing (changing)** — implemented today, but the redesign alters it

## Color palette

Source of truth: `src/utils/timesheetTheme.ts`. Do not hardcode hex values anywhere else.

| Name | Hex | Used for |
|---|---|---|
| `PRIMARY` | `#D9EAF7` | Day/date headers, activity label column, daily total rows |
| `PRIMARY_DARK` | `#A4C2F4` | Dividers, prominent section headers |
| `SECONDARY` | `#E4DDF2` | Pay period / employee name header rows |
| `ACCENT` | `#FCA5A5` | Holiday name cells and holiday-column header rows |
| `MUTED_ACCENT` | `#FEE2E2` | Holiday columns on even-indexed activity rows |
| `MUTED_ACCENT_DARK` | `#FECACA` | Holiday columns on odd-indexed activity rows |
| `MUTED` | `#F1F3F4` | Weekend cells, summary values |
| `MUTED_DARK` | `#D9D9D9` | Borders, inactive cells, alternating rows |
| `TEXT` | `#3C4043` | Standard body text |
| `HEADER_TEXT` | `#243447` | Header text |
| `WHITE` / `BLACK` | — | Text/border utility colors |

## Block borders

Each block gets a medium-width border around its full bounding range (all rows/columns the block
spans), colored to match the block's dominant section color:

| Block | Border color |
|---|---|
| Summary | `SECONDARY` (`#E4DDF2`) |
| Week | `PRIMARY_DARK` (`#A4C2F4`, sampled as `#a3c2f4`) |
| Approval | `MUTED` (`#F1F3F4`, sampled as `#f0f3f4`) |
| Totals | `MUTED` (`#F1F3F4`, sampled as `#f0f3f4`) |

## Column layout

All 0-based. `maxDays` is the widest week across the timesheet (usually 7).

| Column(s) | Index | Purpose |
|---|---|---|
| A | 0 | Label column |
| B…(N+1) | 1…N | One column per day (N = `maxDays`) |
| Last | N+1 | Weekly/section total column |

---

## Block: Summary (identity header)

Rows 1-4 at the top of the sheet. Fixed, not repeated. **Border: `SECONDARY`, medium width, around the
full 4-row block (Proposed — today each row is bordered individually, not the block as a whole).**

| Row type | Status | Content | Style |
|---|---|---|---|
| `identityRow` | Existing | Employee name / position / "Pay Period:" label / pay period date range — one value per row, column A only | `SECONDARY` fill, `HEADER_TEXT`, bold, left-aligned, full border |

---

## Block: Week (repeated once per week in the pay period)

**Border: `PRIMARY_DARK`, medium width, around each week's full bounding range (Proposed — new).**

### Row order

1. `weekLabelRow` **(Existing, changing)** — this *is* the existing Holiday Name Row; only its label
   cell (column A) changes. When the week has a holiday, that row already displays the holiday name in
   the holiday's own column — unaffected. The change is adding the week's date-range label to column A,
   which today is unused/blank on this row.
2. `dayOfWeekRow` (Existing)
3. `dateRow` (Existing)
4. `headerSpacerRow` — always present, separating `dateRow` from whichever section comes first that
   week (Hourly, or Flat Rate if the employee has no Hourly activities)
5. Hourly section — **omitted entirely (no `sectionLabelRow`, no `activityRow`s, no `dailyTotalRow`) if the employee has zero hourly activities that week**:
   - `sectionLabelRow` **(Proposed)** — "Hourly"
   - `activityRow` × N (Existing)
   - `dailyTotalRow` (Existing)
6. `spacerRow` — this *is* the existing `formatDividerRows.ts` divider row (same concept, not a new style).
   **Only appears when both sections are present that week** — if a week has only Flat Rate activities (no
   Hourly), the Flat Rate `sectionLabelRow` follows `headerSpacerRow` directly, no `spacerRow` in between
7. Flat Rate section — **omitted entirely (same rule) if the employee has zero flat-rate activities that week**:
   - `sectionLabelRow` **(Proposed)** — "Flat Rate"
   - `activityRow` × N (Existing)
   - `dailyTotalRow` **(Existing, changing)** — currently only built for the Hourly section; the redesign adds one for Flat Rate too

### Row types

| Row type | Status | Content | Style |
|---|---|---|---|
| `weekLabelRow` | Implemented | Existing Holiday Name Row; label cell (column A) also carries e.g. "Week 1/19 - 1/25" | Whole row `SECONDARY`/`HEADER_TEXT`, unless a holiday column overrides it to `ACCENT`. Label cell additionally bold/left-aligned |
| `dayOfWeekRow` | Implemented | Mon/Tue/.../Sun | `PRIMARY_DARK`, `HEADER_TEXT`, bold, centered. Holiday columns → `ACCENT` |
| `dateRow` | Implemented | Day numbers (1/19, 1/20, ...) | Same as `dayOfWeekRow`. Total column left blank — `sectionLabelRow` carries "Total" now |
| `headerSpacerRow` | Implemented | Blank visual gap between `dateRow` and whichever section comes first | `SECONDARY` fill, `HEADER_TEXT`, holiday columns → `ACCENT`. Row height halved (`SPACER_ROW_HEIGHT`, ~10px), same as `spacerRow` |
| `sectionLabelRow` | Implemented | "Hourly" / "Flat Rate" in column A; "Total" in the total column | Same styling as `dayOfWeekRow` (`PRIMARY_DARK`/`HEADER_TEXT`, bold, centered, holiday columns → `ACCENT`) |
| `activityRow` | Existing | One row per activity, day-of-week values | Label column: `PRIMARY`/`HEADER_TEXT`. Day cells: alternating `WHITE`/`MUTED` by row index within the section. Weekend/holiday columns always overridden to `MUTED_ACCENT`/`MUTED_ACCENT_DARK` regardless of alternation — **same alternating behavior for both Hourly and Flat Rate sections, no special-casing.** Hourly rows get 2-decimal hour validation; flat-rate rows get whole-number validation |
| `dailyTotalRow` | Implemented (now applies per-section, not just once per week) | Sum formula per day column | `PRIMARY_DARK`/`HEADER_TEXT`, bold, centered; label cell left-aligned |
| `spacerRow` | Implemented | Blank visual gap between sections | Same as today's `formatDividerRows.ts` — `WHITE` fill, `HEADER_TEXT`. Row height is halved (`SPACER_ROW_HEIGHT`, ~10px) for a cleaner break |

### Resolved: holiday-column coloring for flat-rate rows

`formatActivityRows.ts`'s holiday-column coloring comment claims flat-rate rows should use different
even/odd holiday colors than regular rows, but the code doesn't actually branch on `isFlatRateSection`.
**Decision: keep current behavior as-is (consistent coloring across both sections) and fix the stale
comment** — do not implement a flat-rate-specific holiday color.

---

## Block: Approval

Fixed, appears once after the last week block. **Border: `MUTED`, medium width, around the full block
(Proposed — new).**

| Row type | Status | Content | Style |
|---|---|---|---|
| `signatureRow` | Existing | "Employee Signature:" / "Supervisor Signature:" label + value (merged B:D) | Label: `PRIMARY`/`HEADER_TEXT` left-aligned. Value: `MUTED`/`TEXT` left-aligned, bordered, merged |
| `includeInPayrollRow` | Existing | "Include in Payroll" label + real checkbox | Label: `PRIMARY`/`HEADER_TEXT` left-aligned. Value cell: boolean data validation (checkbox) |

---

## Block: Totals

Fixed, appears after the Approval block. **Border: `MUTED`, medium width, around the full block
(Proposed — new).**

| Row type | Status | Content | Style |
|---|---|---|---|
| `summaryRow` | Existing | e.g. "Total Hours Worked" / "Holiday Hours" / "Flat Rate Shifts" — label + computed value | Label: `PRIMARY`/`HEADER_TEXT` left-aligned. Value: `MUTED`/`TEXT` centered |

---

## ClockInOut Timesheets

Built by `buildClockInOutTimesheet.ts` (rows) and `formatting/formatClockInOutTimesheet.ts`
(formatting) — used instead of everything above when `Settings.timeInputMethod` is `ClockInOut`. Uses
the same color palette (see top of this doc) but a completely different row/column structure: weeks sit
**side by side**, not stacked, and there's no activity-per-row grid — instead each day gets a fixed
number of generic entry slots.

### Column layout

Each week gets its own 4-column group, `CLOCK_IN_OUT_WEEK_COLUMN_WIDTH = 4`, at
`labelColumnIndex = weekIndex * (4 + 1)` (the `+1` is a 1-column spacer between week groups):

| Offset within group | Column offset constant | Purpose |
|---|---|---|
| 0 | `CLOCK_IN_OUT_ACTIVITY_COLUMN_OFFSET` | Activity dropdown (also the Flat Rate row's activity name) |
| 1 | `CLOCK_IN_OUT_IN_COLUMN_OFFSET` | Clock In (also the Flat Rate row's merged "Shifts" cell start) |
| 2 | `CLOCK_IN_OUT_OUT_COLUMN_OFFSET` | Clock Out (also the Flat Rate row's merged "Shifts" cell end) |
| 3 | `CLOCK_IN_OUT_TOTAL_COLUMN_OFFSET` | Display-only Total formula |

The activity column (offset 0) is widened to `CLOCK_IN_OUT_ACTIVITY_COLUMN_WIDTH = 250`px so long
activity names aren't cut off.

### Row order (rows are shared across every week's column group — every week has the same day count)

1. `weekLabelRow` — styled `SECONDARY` (not `PRIMARY_DARK` — deliberately lighter than the day headers
   below it).
2. Per day, repeated for every day in the pay period:
   - `dayHeaderRow` — day name + date, styled `dayOfWeekRow` (`PRIMARY_DARK`/`HEADER_TEXT`, bold,
     centered).
   - `columnHeaderRow` — "Hourly" / "In" / "Out" / "Total" labels, styled `dailyTotalRow`
     (`PRIMARY_DARK`/`HEADER_TEXT`, bold, **left-aligned** — not centered, so it reads as a section
     label rather than a data header).
   - `CLOCK_IN_OUT_SLOTS_PER_DAY` (6) slot rows — activity dropdown (data validation against the
     employee's assigned activities) + Clock In + Clock Out (both formatted `hh:mm AM/PM`, data-validated
     to blank-or-a-real-time-of-day) + a display-only Total formula. Zebra-striped `MUTED`/`PRIMARY`
     (`mutedDataEntryRow`/`primaryDataEntryRow` in `rowStyles.ts`), restarting at index 0 for each day
     (not continuing across days).
   - **If the employee has any flat-rate activities**, that day's own Flat Rate section directly below
     the slots: a section-label row (styled the same left-aligned `dailyTotalRow` as `columnHeaderRow`,
     with the In/Out columns merged into one "Shifts" header cell), then one row per flat-rate activity
     (activity name + a merged Shifts entry cell), zebra-striped the same way, restarting at index 0.
   - A thick (`SOLID_THICK`, width 3) `PRIMARY_DARK` border box wraps the day's whole block — Hourly
     slots plus Flat Rate section if present — via `outlineBlockBorder.ts`'s `thick` parameter.
   - A blank break row (not styled, just empty) separates this day from the next — omitted after the
     last day.

### Data validation

- Activity dropdown: same `setActivityDataValidation` mechanism as TotalHours mode, restricted to the
  employee's assigned activities.
- Clock In / Clock Out: `CUSTOM_FORMULA`, `strict: true` — `OR(ISBLANK(cell), AND(ISNUMBER(cell),
  cell>=0, cell<1))`. A real Sheets time value is always a day-fraction in `[0, 1)`; the `>=0`/`<1`
  bounds reject plain typed numbers (e.g. `2`, `5`), which are `ISNUMBER`-true but not valid times —
  added after live testing produced a nonsense 72-hour total from exactly that input.

### Not enforced by sheet-level validation (enforced at read time instead — see `BUSINESS_RULES.md`)

Whether Clock Out is after Clock In, whether both slot cells are filled together, and what happens with
an unrecognized activity name are all validated by `readClockInOutSlotRows.ts` at report-generation
time, not by anything on the sheet itself — the sheet only guarantees "blank or a syntactically valid
time," nothing about the relationship between two cells.

## Open questions

None outstanding — all resolved above.
