// Computes elapsed hours between a Clock In and Clock Out time, rounded to the nearest quarter hour
// (round-half-up at the .125-hour tie) — called by readTimesheetEntries once it has parsed and validated
// a ClockInOut slot row's In/Out cells (Clock Out already confirmed >= Clock In upstream, so this never
// sees a negative span). Both parameters are decimal hours-of-day (e.g. 9:30 AM is 9.5).
// Known simplifications, out of scope for this phase (see [080]): no break deduction, only one In/Out
// pair per day, and no overnight shifts (Clock Out on the following calendar day) — revisit this
// function if any of those are picked up later.
const calculateClockInOutHours = (clockInHours: number, clockOutHours: number): number => {
  const elapsedHours = clockOutHours - clockInHours;
  return Math.round(elapsedHours * 4) / 4;
};

export default calculateClockInOutHours;
