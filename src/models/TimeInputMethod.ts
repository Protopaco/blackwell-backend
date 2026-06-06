// Stored as "TimesheetTemplate" in the Apps Script config sheet.
// Renamed to TimeInputMethod in this codebase — cleanup in Apps Script is a future task.
const TimeInputMethod = {
  TotalHours: 'TotalHours',
  ClockInOut: 'ClockInOut',
} as const;

type TimeInputMethod = typeof TimeInputMethod[keyof typeof TimeInputMethod];

export { TimeInputMethod };
export type { TimeInputMethod as TimeInputMethodType };
